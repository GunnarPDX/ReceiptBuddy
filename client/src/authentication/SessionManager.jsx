import React, {Component} from "react";
import Registration from "./Registration";
import Login from "./Login"
import ValidationTest from "./ValidationTest";
import {Link} from "react-router-dom";

class SessionManager extends Component {

    handleLogOut = () => {
        localStorage.removeItem('access-token');
        localStorage.removeItem('client');
        localStorage.removeItem('uid');
        window.location.reload(false);
    };

    render() {
        const token = localStorage.getItem('access-token');
        if (token !== null && token !== undefined) {
            return (
                <div>
                    <h1>
                        Signed In
                    </h1>
                    <Link to={'/receipts'} className={'standard-button'}> Add Receipts </Link>
                    <button onClick={this.handleLogOut} className={'standard-button'}> log-out </button>
                    <br/>
                    <br/>
                    <br/>
                </div>
            )
        } else return (
            <div>
                <Registration/>
                <br/>
                <br/>
                <a className={'App-link'}>Or</a>
                <Login/>
                <br/>
                <br/>
                <br/>
            </div>
        )
    };
}

export default SessionManager;