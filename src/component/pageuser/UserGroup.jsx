import React from 'react';
import './UserGroup.css';
import Loading from "../box/Loading";
import Table from '../table/Table';
import Group from '../item/Group';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import FormLine from '../button/FormLine';
import DialogConfirmation from '../dialog/DialogConfirmation';
import {dictToURI} from '../../utils/url';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


export default class UserGroup extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getGroups = this.getGroups.bind(this);
		this.getAdmins = this.getAdmins.bind(this);
		this.getAssignments = this.getAssignments.bind(this);
		this.addGroup = this.addGroup.bind(this);
		this.deleteGroup = this.deleteGroup.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		this.state = {
			groups: null,
			admins: null,
			assignments: null,
			newGroup: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
	}

	refresh() {
		this.getGroups();
		this.getAdmins();
		this.getAssignments();
	}

	getGroups() {
		this.setState({
			groups: null
		});
		
		getRequest.call(this, "user/get_user_groups", data => {
            this.setState({
                groups: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	getAdmins() {
		this.setState({
			admins: null
		});
		
		getRequest.call(this, "user/get_users?admin_only=true", data => {
            this.setState({
                admins: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	getAssignments() {
		this.setState({
			assignments: null
		});
		
		getRequest.call(this, "user/get_user_group_assignments", data => {
            this.setState({
                assignments: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	addGroup() {
		let params = {
			name: this.state.newGroup
		}

    	postRequest.call(this, "user/add_user_group", params, response => {
            this.getGroups();
            nm.info("The value has been added");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	deleteGroup(id) {
		let params = {
			id: id		
		}

        postRequest.call(this, "user/delete_user_group", params, response => {
            this.getGroups();
            nm.info("The value has been deleted");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    onDragEnd(result) {
	    if (!result.destination) {
	      	return;
	    }

	    let params = {
			group: parseInt(result.destination.droppableId),
    		user: parseInt(result.draggableId)
    	}

	    postRequest.call(this, "user/update_user_group_assignment", params, response => {
            nm.info("The modification has been saved");
            this.getAssignments();
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		const getItemStyle = (isDragging, draggableStyle) => ({
			...draggableStyle,
		});

		let columns = [
          	{
                Header: 'Name',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <Group
                        id={value.id}
                        name={value.name}
                        afterDeletion={() => this.refresh()}
                    />
                )
            },
        ];

		return (
			<div id="UserGroup" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Group</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-xl-12">
                        <FormLine
                            label={"New group"}
                            value={this.state.newGroup}
                            onChange={v => this.changeState("newGroup", v)}
                        />
                    </div>
                    <div className="col-xl-12 right-buttons">
                        <button
                            className={"blue-background"}
                            onClick={this.addGroup}
                            disabled={this.state.newGroup === null || this.state.newGroup.length < 3}>
                            <i className="fas fa-plus"/> Add group
                        </button>
                    </div>
				    <div className="col-md-12 PageCompany-table">
                        {this.state.groups !== null ?
                            <div className="fade-in">
                                <Table
                                    columns={columns}
                                    data={this.state.groups}
                                    showBottomBar={true}
                                />
                            </div>
                            :
                            <Loading
                                height={500}
                            />
                        }
                    </div>
                </div>

                <div className={"row"}>
					<div className="col-md-12">
						<h1>Admin assignments</h1>
					</div>
				</div>

				{this.state.groups !== null && this.state.admins !== null && this.state.assignments !== null ?
            		<div className="row row-spaced">
                		<div className="col-xl-12">
                            <DragDropContext onDragEnd={this.onDragEnd}>
                            	<Droppable 
                        			droppableId="null" 
                        			direction="horizontal">
                        			{(provided, snapshot) => (
							            <div
							            	ref={provided.innerRef}
							            	className="Droppable-bar Droppable-bar-unassigned"
							            	{...provided.droppableProps}>
							            	<div>Not assigned</div>
							              	{this.state.admins
							              		.filter(v => this.state.assignments.map(a => { return a.user_id }).indexOf(v.id) < 0)
							              		.map((item, index) => { return (
								                <Draggable 
								                	key={"" + item.id} 
								                	draggableId={"" + item.id} 
								                	index={index}>
								                	{(provided, snapshot) => (
									                    <div
									                    	className="Droppable-element"
									                    	ref={provided.innerRef}
										                    {...provided.draggableProps}
										                    {...provided.dragHandleProps}
										                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
									                      	{item.email}
									                    </div>
									                )}
								                </Draggable>
							              	)})}
							              	{provided.placeholder}
							            </div>
							        )}
						        </Droppable>
                            	{this.state.groups.map(g => { return (
                            		<Droppable 
                            			droppableId={"" + g.id}
                            			direction="horizontal">
                            			{(provided, snapshot) => (
								            <div
								            	ref={provided.innerRef}
								            	className="Droppable-bar"
								            	{...provided.droppableProps}>
								            	<div>{g.name}</div>
								              	{this.state.assignments
								              		.filter(v => g.id === v.group_id)
								              		.map((item, index) => { return (
									                <Draggable 
									                	key={"" + item.id} 
									                	draggableId={"" + item.id} 
									                	index={index}>
									                	{(provided, snapshot) => (
										                    <div
										                    	className="Droppable-element"
										                    	ref={provided.innerRef}
											                    {...provided.draggableProps}
											                    {...provided.dragHandleProps}
											                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
										                      	{this.state.admins.filter(v => v.id === item.user_id).length > 0 ?
										                      		this.state.admins.filter(v => v.id === item.user_id)[0].email
										                      		: 
										                      		"Error"
										                      	}
										                    </div>
										                )}
									                </Draggable>
								              	)})}
								              	{provided.placeholder}
								            </div>
								        )}
							        </Droppable>
                            	)})}
						    </DragDropContext>
						</div>
					</div>
				: 
					<Loading
                		height={300}
                	/>
                }
			</div>
		);
	}
}