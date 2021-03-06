import {Dispatcher} from "flux";


class LoginDispatcher extends Dispatcher {

	handleServerAction(action) {
		return this.dispatch({
			source: "SERVER_ACTION",
			action: action
		});
	}

	handleViewAction(action) {
		return this.dispatch({
			source: "VIEW_ACTION",
			action: action
		});	
	}
}

export default new LoginDispatcher();