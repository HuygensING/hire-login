import {Dispatcher} from "flux";


class LoginDispatcher extends Dispatcher {
/*
	handleViewAction(action) {
		return this.dispatch({
			source: "VIEW_ACTION",
			action: action
		});
	}
*/

	handleServerAction(action) {
		return this.dispatch({
			source: "SERVER_ACTION",
			action: action
		});
	}
}

export default new LoginDispatcher();