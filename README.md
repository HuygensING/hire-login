# Login component for React


```javascript
import {Login, Federated, Basic} from "hire-login";

class App extends React.Component {
	render() {
		return (
			<div className="app">
				<Login
					appId="app-id"
					userUrl="user-data-url"
					headers={{optional: "header"}}
					onChange={function(check) { console.log("CHECK callback!", check); }}>
					<Federated url="federated-auth-url"  />
					<Basic url="basic-auth-url" />
				</Login>
			</div>
		);
	}
}

```
