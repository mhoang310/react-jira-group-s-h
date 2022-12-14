import React, {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import lodash from 'lodash';
import {
    MessageOutlined,
    LinkOutlined,
    BugOutlined,
    RocketOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { Input, Popconfirm, Select, Slider } from 'antd';
import { http } from '../../apis';
import {
    getAllCommentURL,
    getAllPriorityURL,
    getAllStatusURL,
    getAllTaskTypeURL,
    getUserByProjectIdURL,
} from '../../apis/apiURL';
import {
    deleteTaskDetailThunk,
    updateTaskDetailThunk,
} from '../../redux/thunk';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import DebounceSelectMember from '../../components/DebounceSelectMember/DebounceSelectMember';
import { getTaskDetail, getViewPort } from '../../redux/selectors';
import {
    updateStatusTaskProjectDetail,
    updateTaskProjectDetail,
} from '../../redux/reducer/projectDetailSlice';
import CommentComponent from '../../components/CommentComponent/CommentComponent';

const { Option } = Select;

function TaskDetail({ isCreatorProject, projectId, setVisibleModal }) {
    const dispatch = useDispatch();
    const viewPort = useSelector(getViewPort);
    const { width } = viewPort.data;

    //Store Data Select Field from  API response
    const [dataField, setDataField] = useState({
        status: [],
        priority: [],
        taskType: [],
        comments: [],
    });

    const { data: taskDetailData } = useSelector(getTaskDetail);
    //Task Detail
    const {
        taskTypeDetail,
        priorityTask,
        taskName,
        description,
        statusId,
        assigness,
        taskId,
        originalEstimate,
        timeTrackingRemaining,
        timeTrackingSpent,
    } = taskDetailData;

    const [taskTypeUpdate, setTypeUpdate] = useState(taskTypeDetail.id);
    const descriptionUpdate = useRef(description);

    const [members, setMembers] = useState(
        assigness.map((member) => {
            return {
                key: member.id,
                label: member.name,
                value: member.id,
            };
        }) || []
    );

    //Load All API Input fields
    useLayoutEffect(() => {
        const getAllField = async () => {
            try {
                let arrayField = ['status', 'priority', 'taskType', 'comments'];
                const getStatusAPI = http.get(getAllStatusURL);
                const getPriorityAPI = http.get(getAllPriorityURL);
                const getTaskTypeAPI = http.get(getAllTaskTypeURL);
                const getAllCommentAPI = http.get(
                    `${getAllCommentURL}?taskId=${taskId}`
                );
                Promise.all([
                    getStatusAPI,
                    getPriorityAPI,
                    getTaskTypeAPI,
                    getAllCommentAPI,
                ]).then((data) => {
                    const newData = data.map((item, index) => {
                        return {
                            [arrayField[index]]: item.data.content,
                        };
                    });
                    let objectData = {};
                    newData.forEach((item) => {
                        objectData = { ...objectData, ...item };
                    });

                    setDataField({
                        ...dataField,
                        ...objectData,
                    });
                });
            } catch (err) {
                // toast.error('Cannot get data field!');
                console.log(err);
            }
        };
        getAllField();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Function update Task Detail
    const handleUpdateTaskDetail = useRef(null);
    handleUpdateTaskDetail.current = (fieldUpdate) => {
        const dataUpdate = {
            listUserAsign: assigness.map((user) => user.id),
            taskId: String(taskId),
            taskName: taskName,
            description: description,
            statusId: statusId,
            originalEstimate: originalEstimate,
            timeTrackingSpent: timeTrackingSpent,
            timeTrackingRemaining: timeTrackingRemaining,
            projectId: Number(projectId),
            typeId: taskTypeDetail.id,
            priorityId: priorityTask.priorityId,
        };
        const newDataUpdate = {
            ...dataUpdate,
            ...fieldUpdate,
        };
        return newDataUpdate;
    };

    //Handle Copy Link Project
    const handleCopyLink = useCallback(async () => {
        const promise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                navigator.clipboard.writeText(window.location.href);
                clearTimeout(timer);
                resolve('Copy Successfully');
            }, [300]);
        });
        promise.then((data) => {
            // toast.success('Copy Link Successfully', {
            //     autoClose: 500,
            // });
            console.log(data);
        });
    }, []);

    //Handle Change Type TaskDetail (newTask, bug)
    const handleChangeTypeTask = useCallback(
        (e) => {
            const dataUpdate = handleUpdateTaskDetail.current({ typeId: e });
            const updateTaskApi = updateTaskDetailThunk(
                dataUpdate,
                updateTaskProjectDetail,
                (taskDetail) => setTypeUpdate(taskDetail.typeId)
            );
            dispatch(updateTaskApi);
        },
        [dispatch]
    );

    //Handle Debounce All Field
    const debouncedFilter = useRef(
        lodash.debounce((payload, actions, callback) => {
            const dataUpdate = handleUpdateTaskDetail.current(payload);
            const updateTaskApi = updateTaskDetailThunk(
                dataUpdate,
                actions,
                callback
            );
            dispatch(updateTaskApi);
        }, 300)
    );

    //Handle Update Status TaskDetail
    const handleChangeStatusTask = useCallback((e) => {
        if (!e) return;
        debouncedFilter.current({ statusId: e }, updateStatusTaskProjectDetail);
    }, []);

    //Handle Update Assignees TaskDetail
    const handleUpdateAssignees = useCallback(
        (newValue) => {
            const dataUpdate = handleUpdateTaskDetail.current({
                listUserAsign: newValue.map((member) => member.value),
            });
            const updateTaskApi = updateTaskDetailThunk(
                dataUpdate,
                updateTaskProjectDetail,
                () => setMembers(newValue)
            );
            dispatch(updateTaskApi);
        },
        [dispatch]
    );

    //Handle Update Description TaskDetail
    const handleChangeDescriptionTask = useCallback((e) => {
        if (!e) return;
        debouncedFilter.current(
            {
                description: e,
            },
            updateTaskProjectDetail,
            (taskDetail) => (descriptionUpdate.current = taskDetail.description)
        );
    }, []);
    //Handle Update Original Estimate TaskDetail
    const handleChangeEstimate = useCallback((e) => {
        if (!e) return;
        debouncedFilter.current(
            {
                originalEstimate: e.target.value,
            },
            updateTaskProjectDetail
        );
    }, []);

    //Handle Update Priority TaskDetail
    const handleChangePriorityTask = useCallback((e) => {
        if (!e) return;
        debouncedFilter.current(
            {
                priorityId: e,
            },
            updateTaskProjectDetail
        );
    }, []);

    //Handle Update Time Tracking Spent
    const handleChangeTimeTrackingSpent = useCallback((e) => {
        if (!e) return;
        debouncedFilter.current(
            {
                timeTrackingSpent: e.target.value,
            },
            updateTaskProjectDetail
        );
    }, []);

    //Handle Update Time Tracking Remaining
    const handleChangeTimeTrackingRemaining = useCallback((e) => {
        if (!e) return;
        debouncedFilter.current(
            {
                timeTrackingRemaining: e.target.value,
            },
            updateTaskProjectDetail
        );
    }, []);

    //Handle Delete Task
    const handleDeleteTask = useCallback(() => {
        const removeTaskApi = deleteTaskDetailThunk(
            taskId,
            statusId,
            setVisibleModal
        );
        dispatch(removeTaskApi);
    }, [dispatch, setVisibleModal, statusId, taskId]);

    //Get Member in Project
    async function fetchUserList() {
        try {
            const response = await http.get(
                `${getUserByProjectIdURL}?idProject=${projectId}`
            );
            return response.data.content.map((user) => ({
                label: user.name,
                value: user.userId,
            }));
        } catch (err) {
            // toast.error('Cannot load data user');
            console.log(err);
        }
    }
    let body;
    if (width <= 1023) {
        body = (
            <section className="taskDetail-responsive">
                <div className="taskDetailHeader-responsive">
                    <div className="taskDetailHeader__item-responsive">
                        <div className="taskDetailHeader__leftItem-responsive">
                            <div className="taskDetailHeader__leftItemIcon-responsive">
                                {taskTypeUpdate === 1 ? (
                                    <BugOutlined
                                        style={{
                                            color:
                                                colorFlag[
                                                    priorityTask?.priority
                                                ] || '#000',
                                        }}
                                    />
                                ) : (
                                    <RocketOutlined
                                        style={{
                                            color:
                                                colorFlag[
                                                    priorityTask?.priority
                                                ] || '#000',
                                        }}
                                    />
                                )}
                            </div>
                            <div>
                                <Select
                                    style={{ width: 120 }}
                                    defaultValue={taskTypeDetail.id}
                                    onChange={handleChangeTypeTask}
                                >
                                    {dataField?.taskType.length > 0 &&
                                        dataField?.taskType.map((item) => {
                                            return (
                                                <Option
                                                    key={item.id}
                                                    value={item.id}
                                                    disabled={!isCreatorProject}
                                                >
                                                    {item.taskType}
                                                </Option>
                                            );
                                        })}
                                </Select>
                            </div>
                            <div>{taskName}</div>
                        </div>
                    </div>
                    <div className="taskDetailHeader__item-responsive">
                        <div className="taskDetailHeader__rightItem-responsive">
                            <MessageOutlined />
                            <LinkOutlined
                                onClick={() => {
                                    handleCopyLink();
                                }}
                            />
                            {isCreatorProject && (
                                <Popconfirm
                                    placement="top"
                                    title="Are you sure to delete this task?"
                                    onConfirm={handleDeleteTask}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined />
                                </Popconfirm>
                            )}
                        </div>
                    </div>
                </div>
                <div className="taskDetailBody-responsive">
                    <div className="taskDetailBody_item-responsive">
                        <h4>STATUS</h4>
                        <Select
                            style={{ width: '100%' }}
                            defaultValue={statusId}
                            onChange={handleChangeStatusTask}
                        >
                            {dataField?.status.length > 0 &&
                                dataField?.status.map((item) => {
                                    return (
                                        <Option
                                            key={item.statusId}
                                            value={item.statusId}
                                            disabled={!isCreatorProject}
                                        >
                                            {item.statusName}
                                        </Option>
                                    );
                                })}
                        </Select>
                    </div>
                    <div className="taskDetailBody_item-responsive">
                        <h4>ASSIGNEES</h4>
                        <DebounceSelectMember
                            mode="multiple"
                            value={members}
                            placeholder="No member be assigned to this task..."
                            fetchOptions={fetchUserList}
                            onChange={(newValue) => {
                                handleUpdateAssignees(newValue);
                            }}
                            style={{
                                width: '100%',
                            }}
                            disabled={!isCreatorProject}
                        />
                    </div>
                    <div className="taskDetailBody_item-responsive">
                        <h4>PRIORITY</h4>
                        <Select
                            style={{
                                width: '100%',
                            }}
                            defaultValue={priorityTask?.priorityId}
                            onChange={handleChangePriorityTask}
                        >
                            {dataField?.priority.length > 0 &&
                                dataField?.priority.map((item) => {
                                    return (
                                        <Option
                                            key={item.priorityId}
                                            value={item.priorityId}
                                            style={{
                                                color: !isCreatorProject
                                                    ? '#ccc '
                                                    : colorFlag[item.priority],
                                            }}
                                            disabled={!isCreatorProject}
                                        >
                                            {item.priority}
                                        </Option>
                                    );
                                })}
                        </Select>
                    </div>
                    <div className="taskDetailBody_item-responsive">
                        <h4>ORIGINAL ESTIMATE (HOURS)</h4>
                        <Input
                            id="originalEstimate"
                            type="number"
                            defaultValue={originalEstimate}
                            onChange={handleChangeEstimate}
                            disabled={!isCreatorProject}
                        />
                    </div>
                    <div className="taskDetailBody_item-responsive">
                        <h4>
                            <ClockCircleOutlined />
                            TIME TRACKING
                        </h4>
                        <Slider
                            max={
                                Number(timeTrackingSpent) +
                                Number(timeTrackingRemaining)
                            }
                            value={timeTrackingSpent}
                            style={{
                                margin: '0',
                                pointerEvents: 'none',
                            }}
                            trackStyle={{
                                backgroundColor: '#001529',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div className="formCreateEditTask__fieldTitle">
                                {timeTrackingSpent || 0}h logged
                            </div>
                            <div className="formCreateEditTask__fieldTitle">
                                {timeTrackingRemaining || 0}h remaining
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '5px',
                                marginTop: '10px',
                            }}
                        >
                            <Input
                                id="timeTrackingSpent"
                                type="number"
                                defaultValue={timeTrackingSpent}
                                onChange={handleChangeTimeTrackingSpent}
                                disabled={!isCreatorProject}
                            />
                            <Input
                                id="timeTrackingRemaining"
                                type="number"
                                defaultValue={timeTrackingRemaining}
                                onChange={handleChangeTimeTrackingRemaining}
                                disabled={!isCreatorProject}
                            />
                        </div>
                    </div>
                </div>
                <div className="taskDetailFooter-responsive">
                    <h4>COMMENT</h4>
                    <CommentComponent
                        dataField={dataField}
                        taskIdDetail={taskId}
                        setDataField={setDataField}
                    />
                </div>
            </section>
        );
    } else {
        body = (
            <section className="taskDetail">
                {/* Header */}
                <div className="taskDetailHeader">
                    <div className="taskDetailHeader__left">
                        <div className="taskDetailHeader__leftItem">
                            <div className="taskDetailHeader__leftItem">
                                {taskTypeUpdate === 1 ? (
                                    <BugOutlined
                                        style={{
                                            color:
                                                colorFlag[
                                                    priorityTask?.priority
                                                ] || '#000',
                                        }}
                                    />
                                ) : (
                                    <RocketOutlined
                                        style={{
                                            color:
                                                colorFlag[
                                                    priorityTask?.priority
                                                ] || '#000',
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="taskDetailHeader__leftItem">
                            <Select
                                style={{ width: 120 }}
                                defaultValue={taskTypeDetail.id}
                                onChange={handleChangeTypeTask}
                            >
                                {dataField?.taskType.length > 0 &&
                                    dataField?.taskType.map((item) => {
                                        return (
                                            <Option
                                                key={item.id}
                                                value={item.id}
                                                disabled={!isCreatorProject}
                                            >
                                                {item.taskType}
                                            </Option>
                                        );
                                    })}
                            </Select>
                        </div>
                        <div className="taskDetailHeader__leftItem">
                            Task Name: {taskName}
                        </div>
                    </div>
                    <div className="taskDetailHeader__right">
                        <div className="taskDetailHeader__rightItem">
                            <MessageOutlined />
                            <span>Give feedback</span>
                        </div>
                        <div
                            className="taskDetailHeader__rightItem"
                            onClick={() => {
                                handleCopyLink();
                            }}
                        >
                            <LinkOutlined />
                            <span>Copy Link</span>
                        </div>
                        {isCreatorProject && (
                            <div className="taskDetailHeader__rightItem">
                                <Popconfirm
                                    placement="top"
                                    title="Are you sure to delete this task?"
                                    onConfirm={handleDeleteTask}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined />
                                </Popconfirm>
                            </div>
                        )}
                    </div>
                </div>
                {/* Body */}
                <div className="taskDetailBody">
                    <div className="taskDetailBody__left">
                        <div className="taskDetailBody__leftItem">
                            <h3>
                                {`This is an issue of type :  ${taskTypeDetail.taskType}`}
                            </h3>
                        </div>
                        <div className="taskDetailBody__leftItem">
                            <h4>Description</h4>
                            <div>
                                {isCreatorProject ? (
                                    <ReactQuill
                                        theme="snow"
                                        defaultValue={descriptionUpdate.current}
                                        onChange={handleChangeDescriptionTask}
                                        modules={modules}
                                        formats={formats}
                                    >
                                        <div className="my-editing-area" />
                                    </ReactQuill>
                                ) : (
                                    // ReactHtmlParser(description)
                                    description
                                )}
                            </div>
                        </div>
                        <div className="taskDetailBody__leftItem">
                            <h4>Comment</h4>
                            <CommentComponent
                                dataField={dataField}
                                taskIdDetail={taskId}
                                setDataField={setDataField}
                            />
                        </div>
                    </div>
                    <div className="taskDetailBody__right">
                        <div className="taskDetailBody__rightItem">
                            <h4>STATUS</h4>
                            <Select
                                style={{ width: '100%' }}
                                defaultValue={statusId}
                                onChange={handleChangeStatusTask}
                            >
                                {dataField?.status.length > 0 &&
                                    dataField?.status.map((item) => {
                                        return (
                                            <Option
                                                key={item.statusId}
                                                value={item.statusId}
                                                disabled={!isCreatorProject}
                                            >
                                                {item.statusName}
                                            </Option>
                                        );
                                    })}
                            </Select>
                        </div>
                        <div className="taskDetailBody__rightItem">
                            <h4>ASSIGNEES</h4>
                            <DebounceSelectMember
                                mode="multiple"
                                value={members}
                                placeholder="No member be assigned to this task..."
                                fetchOptions={fetchUserList}
                                onChange={(newValue) => {
                                    handleUpdateAssignees(newValue);
                                }}
                                style={{
                                    width: '100%',
                                }}
                                disabled={!isCreatorProject}
                            />
                        </div>
                        <div className="taskDetailBody__rightItem">
                            <h4>PRIORITY</h4>
                            <Select
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={priorityTask?.priorityId}
                                onChange={handleChangePriorityTask}
                            >
                                {dataField?.priority.length > 0 &&
                                    dataField?.priority.map((item) => {
                                        return (
                                            <Option
                                                key={item.priorityId}
                                                value={item.priorityId}
                                                style={{
                                                    color: !isCreatorProject
                                                        ? '#ccc '
                                                        : colorFlag[
                                                              item.priority
                                                          ],
                                                }}
                                                disabled={!isCreatorProject}
                                            >
                                                {item.priority}
                                            </Option>
                                        );
                                    })}
                            </Select>
                        </div>
                        <div className="taskDetailBody__rightItem">
                            <h4>ORIGINAL ESTIMATE (HOURS)</h4>
                            <Input
                                id="originalEstimate"
                                type="number"
                                defaultValue={originalEstimate}
                                onChange={handleChangeEstimate}
                                disabled={!isCreatorProject}
                            />
                        </div>
                        <div className="taskDetailBody__rightItem">
                            <h4>
                                <ClockCircleOutlined />
                                TIME TRACKING
                            </h4>
                            <Slider
                                max={
                                    Number(timeTrackingSpent) +
                                    Number(timeTrackingRemaining)
                                }
                                value={timeTrackingSpent}
                                style={{
                                    margin: '0',
                                    pointerEvents: 'none',
                                }}
                                trackStyle={{
                                    backgroundColor: '#001529',
                                }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div className="formCreateEditTask__fieldTitle">
                                    {timeTrackingSpent || 0}h logged
                                </div>
                                <div className="formCreateEditTask__fieldTitle">
                                    {timeTrackingRemaining || 0}h remaining
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '5px',
                                    marginTop: '10px',
                                }}
                            >
                                <Input
                                    id="timeTrackingSpent"
                                    type="number"
                                    defaultValue={timeTrackingSpent}
                                    onChange={handleChangeTimeTrackingSpent}
                                    disabled={!isCreatorProject}
                                />
                                <Input
                                    id="timeTrackingRemaining"
                                    type="number"
                                    defaultValue={timeTrackingRemaining}
                                    onChange={handleChangeTimeTrackingRemaining}
                                    disabled={!isCreatorProject}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return body;
}

export default TaskDetail;
const colorFlag = {
    High: 'red',
    Medium: '#096dd9',
    Low: '#1eb290',
    Lowest: '#1eb290',
};
let modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        [{ color: [] }, { background: [] }],
    ],
};

let formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'color',
    'background',
];
