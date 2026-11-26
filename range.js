// @name HideDateRange
// @version 1.0.0
// @description Locally hides all messages, images, and calls between two dates.

(function () {
    // 1. SET YOUR START AND END DATES HERE (YYYY-MM-DDTHH:MM:SS)
    // Example below hides everything from Nov 1, 2026 through Nov 15, 2026
    const START_TIME = new Date("2026-11-02T00:00:00").getTime();
    const END_TIME   = new Date("2026-11-24T23:59:59").getTime();

    function shouldHide(msg) {
        if (!msg || !msg.timestamp) return false;
        const msgTime = new Date(msg.timestamp).getTime();
        return msgTime >= START_TIME && msgTime <= END_TIME;
    }

    const FluxDispatcher = window.unbound?.metro?.common?.FluxDispatcher;
    if (!FluxDispatcher) return;

    function filterMessages(action) {
        if (action.type === "LOAD_MESSAGES_SUCCESS" && Array.isArray(action.messages)) {
            action.messages = action.messages.filter(msg => !shouldHide(msg));
        }
        if (action.type === "MESSAGE_CREATE" && action.message && shouldHide(action.message)) {
            // Prevents newly arriving messages in that date window from rendering
            action.message = null;
        }
    }

    // Intercept message history loads and incoming messages
    const origDispatch = FluxDispatcher.dispatch.bind(FluxDispatcher);
    FluxDispatcher.dispatch = function (action) {
        try {
            if (action && (action.type === "LOAD_MESSAGES_SUCCESS" || action.type === "MESSAGE_CREATE")) {
                filterMessages(action);
                if (action.type === "MESSAGE_CREATE" && !action.message) return;
            }
        } catch (e) {
            console.error("[HideDateRange]", e);
        }
        return origDispatch(action);
    };
})();
