import React from "react";
import "./PageProfile.css";
import vCard from "vcf";
import { NotificationManager as nm } from "react-notifications";
import Loading from "./box/Loading.jsx";
import Info from "./box/Info.jsx";
import FormLine from "./button/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword } from "../utils/re.jsx";

export default class PageProfile extends React.Component {
	constructor(props) {
		super(props);

		this.refreshProfile = this.refreshProfile.bind(this);
		this.changePassword = this.changePassword.bind(this);

		this.state = {
			user: null,
			vcard: null,
			password: null,
			newPassword: null,
			newPasswordConfirmation: null,
		};
	}

	componentDidMount() {
		this.refreshProfile();
	}

	refreshProfile() {
		this.setState({
			user: null,
			vcard: null,
		});

		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
				/* eslint-disable-next-line new-cap */
				vcard: data.vcard ? new vCard().parse(data.vcard) : new vCard(),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changePassword() {
		const params = {
			password: this.state.password,
			new_password: this.state.newPassword,
		};

		postRequest.call(this, "account/change_password", params, () => {
			this.setState({
				password: null,
				newPassword: null,
				newPasswordConfirmation: null,
			});
			nm.info("The password has been changed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getVcardValue(key) {
		if (this.state.vcard && this.state.vcard.get(key)) {
			console.log("VCARD VALUE " + key + ":" + this.state.vcard.get(key));
			console.log("VCARD:" + this.state.vcard.toString());
			return this.state.vcard.get(key).value;
		}

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id={"PageProfile"} className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-4">
						<div className={"row row-spaced"}>
							<div className="col-md-12">
								<div className="PageProfile-white-box">
									<div className="PageProfile-icon centered">
										<i className="fas fa-user-circle"/>
									</div>
									<FormLine
										label={"First name"}
										value={this.getVcardValue("NICKNAME")}
										onChange={(v) => this.state.vcard.set("NICKNAME", v)}
										fullWidth={true}
									/>
									<FormLine
										label={"Name"}
										value={this.getVcardValue("N")}
										onChange={(v) => this.state.vcard.set("N", v)}
										fullWidth={true}
									/>
									<FormLine
										label={"Title"}
										value={this.getVcardValue("TITLE")}
										onChange={(v) => this.state.vcard.set("TITLE", v)}
										fullWidth={true}
									/>
								</div>
							</div>

							<div className="col-md-12">
								<div className="PageProfile-white-box">
									<FormLine
										label={"Plateform"}
										value={this.getVcardValue("URL")}
										onChange={(v) => this.state.vcard.set("URL", v)}
										fullWidth={true}
									/>
									<FormLine
										label={"URL"}
										value={this.getVcardValue("N")}
										onChange={(v) => this.state.vcard.set("N", v)}
										fullWidth={true}
									/>
									<div>
										<div className="right-buttons">
											<button
												className="blue-button"
												onClick={this.resetPassword}
											>
												Change password
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="col-md-8">
						<div className={"row row-spaced"}>
							<div className="col-md-12 PageProfile-white-box">
								<FormLine
									label={"Email"}
									value={this.state.user ? this.state.user.email : ""}
									disabled={true}
								/>
								<FormLine
									label={"Show my email address publicly"}
									type={"checkbox"}
									value={this.getVcardValue("EMAIL") !== null}
									onChange={(v) => this.state.vcard.set("EMAIL", v ? this.state.user.email : null)}
								/>
								<div className="PageProfile-divider"/>
								<FormLine
									label={"Telephone"}
									value={this.getVcardValue("EMAIL") !== null}
									onChange={(v) => this.state.vcard.set("N", v)}
								/>
							</div>
							<div className="col-md-12 PageProfile-white-box">
								fffgs
							</div>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>My information</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refreshProfile()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
						{this.state.user !== null
							? <div>
								<FormLine
									label={"ID"}
									value={this.state.user.id}
									disabled={true}
								/>
								<FormLine
									label={"Email"}
									value={this.state.user.email}
									disabled={true}
								/>
							</div>
							: <Loading
								height={100}
							/>
						}
					</div>
				</div>
				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<h1>Change password</h1>
						{this.state.user !== null
							? <div>
								<FormLine
									label={"Current password"}
									value={this.state.password}
									onChange={(v) => this.changeState("password", v)}
									format={validatePassword}
									type={"password"}
								/>
								<Info
									content={
										<div>
											The password must:<br/>
											<li>contain at least 1 lowercase alphabetical character</li>
											<li>contain at least 1 uppercase alphabetical character</li>
											<li>contain at least 1 numeric character</li>
											<li>contain at least 1 special character such as !@#$%^&*</li>
											<li>be between 8 and 30 characters long</li>
										</div>
									}
								/>
								<FormLine
									label={"New password"}
									value={this.state.newPassword}
									onChange={(v) => this.changeState("newPassword", v)}
									format={validatePassword}
									type={"password"}
								/>
								<FormLine
									label={"New password confirmation"}
									value={this.state.newPasswordConfirmation}
									onChange={(v) => this.changeState("newPasswordConfirmation", v)}
									format={validatePassword}
									type={"password"}
								/>
								<div className="right-buttons">
									<button
										onClick={() => this.changePassword()}
										disabled={!validatePassword(this.state.password)
											|| !validatePassword(this.state.newPassword)
											|| !validatePassword(this.state.newPasswordConfirmation)
											|| this.state.newPassword !== this.state.newPasswordConfirmation}>
										Change password
									</button>
								</div>
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
