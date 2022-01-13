import React, { Component } from "react";
import "./Document.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import { getApiURL } from "../../utils/env.jsx";
import { validateWord } from "../../utils/re.jsx";
import Chip from "../button/Chip.jsx";
import Message from "../box/Message.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";

export default class Document extends Component {
	constructor(props) {
		super(props);

		this.state = {
			document: null,
			word: null,
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	getDocument() {
		this.setState({
			document: null,
		}, () => {
			getRequest.call(this, "media/get_document/" + this.props.id, (data) => {
				this.setState({
					document: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	updateDocument(id, keywords) {
		const params = {
			id,
			keywords,
		};

		postRequest.call(this, "media/update_document", params, () => {
			this.setState({
				word: null,
			}, () => {
				this.getDocument();
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeDocumentValue(property, value) {
		const params = {
			id: this.state.document.id,
			[property]: value,
		};

		postRequest.call(this, "media/update_document", params, () => {
			this.getDocument();
			nm.info("The document has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addKeyword(word) {
		if (this.state.document) {
			let words;

			if (this.state.document.keywords) {
				words = (this.state.document.keywords + " " + word).toLowerCase();
			} else {
				words = word.toLowerCase();
			}

			this.updateDocument(this.state.document.id, words);
		}
	}

	deleteKeyword(word) {
		if (this.state.document && this.state.document.keywords) {
			let words = this.state.document.keywords.split(" ");
			words = words.filter((w) => w !== word).join(" ");
			this.updateDocument(this.state.document.id, words);
		}
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Document " + (this.state.selected ? "Document-selected" : "")}>
						<div className={"Document-document"}>
							<img src={"data:image/jpeg;base64, " + this.props.thumbnail}/>
						</div>

						{this.props.width && this.props.height
							&& <div className={"Document-text"}>
								{this.props.width}x{this.props.height}
							</div>
						}

						{this.props.creationDate
							&& <div className={"Document-text"}>
								{this.props.creationDate}
							</div>
						}
					</div>
				}
				modal
				closeOnDocumentClick
				onOpen={() => this.getDocument()}
			>
				<div className="row">
					<div className="col-md-12">
						<h1 className="Document-title">
                            Document
						</h1>
					</div>

					<div className="col-md-12">
						{this.state.document
							? <div className="row">
								<div className="col-md-12">
									<div className={"Document-document"}>
										<img src={getApiURL() + "public/get_public_document/" + this.props.id}/>
									</div>
								</div>

								<div className="col-md-12">
									<h3>Fields</h3>
								</div>

								<div className="col-md-6 FormLine-label">
									Include in logo generator
								</div>

								<div className="col-md-12">
									<h3>Keywords</h3>
								</div>

								<div className="col-md-12">
									<input
										autoFocus
										className={!validateWord(this.state.word) ? "FormLine-wrong-format" : ""}
										type={"text"}
										value={this.state.word}
										onChange={(v) => this.setState({ word: v.target.value })}
										onKeyPress={(e) => {
											if (e.key === "Enter" && validateWord(this.state.word)) {
												this.addKeyword(this.state.word);
											}
										}}
									/>
								</div>

								<div className="col-md-12 right-buttons">
									<button
										onClick={() => this.addKeyword(this.state.word)}
										disabled={!validateWord(this.state.word)}
									>
										Add keyword
									</button>
								</div>

								<div className="col-md-12">
									{this.state.document.keywords
										? this.state.document.keywords.split(" ").map((w) => <Chip
											key={w}
											label={w}
											value={w}
											onClick={(v) => this.deleteKeyword(v)}
										/>)
										: <Message
											text={"No keyword for this document"}
											height={150}
										/>
									}
								</div>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>
			</Popup>
		);
	}
}
