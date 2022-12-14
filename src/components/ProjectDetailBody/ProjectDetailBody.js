import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateTaskDetail } from '../../redux/reducer/taskDetailSlice';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import TaskLists from './TaskLists';
import { http } from '../../apis';
import { updateStatusURL } from '../../apis/apiURL';

function ProjectDetailBody({
    lstTask = [],
    visible,
    setVisible,
    setLstTaskDetail,
    creator,
    userId,
}) {
    const dispatch = useDispatch();

    const handleOnDragEnd = useCallback(
        async (result) => {
            if (creator.id === userId) {
                const {
                    draggableId: taskId,
                    destination: { droppableId: statusIdDestination, index },
                    source: { index: indexFrom, droppableId: statusFrom },
                } = result;
                if (!statusIdDestination) return;
                if (index === indexFrom && statusIdDestination === statusFrom)
                    return;
                try {
                    let lstTaskPrevious = [...lstTask];
                    //Copy previous task
                    let taskCopy = {
                        ...lstTaskPrevious[Number(statusFrom) - 1]
                            .lstTaskDeTail[indexFrom],
                        statusId: statusIdDestination,
                    };
                    //Delete previous task in existing status
                    let lstDetail = [
                        ...lstTaskPrevious[Number(statusFrom) - 1]
                            .lstTaskDeTail,
                    ];
                    lstDetail.splice(indexFrom, 1);
                    lstTaskPrevious[Number(statusFrom) - 1] = {
                        ...lstTaskPrevious[Number(statusFrom) - 1],
                        lstTaskDeTail: lstDetail,
                    };
                    // Add previous task in destinations status
                    let lstDetailDestination = [
                        ...lstTaskPrevious[Number(statusIdDestination) - 1]
                            .lstTaskDeTail,
                    ];
                    lstDetailDestination.splice(index, 0, taskCopy);
                    lstTaskPrevious[Number(statusIdDestination) - 1] = {
                        ...lstTaskPrevious[Number(statusIdDestination) - 1],
                        lstTaskDeTail: lstDetailDestination,
                    };
                    setLstTaskDetail(lstTaskPrevious);
                    await http.put(updateStatusURL, {
                        taskId: Number(taskId),
                        statusId: statusIdDestination,
                    });
                    toast.success('Update Task Successfully!', {
                        autoClose: 1000,
                    });
                } catch (error) {                    
                    toast.error('Cannot Update Task!', {
                        autoClose: 1000,
                    });
                }
            } else {                
                toast.error('You do not have permission to update!', {
                    autoClose: 1000,
                });
            }
        },
        [creator?.id, lstTask, setLstTaskDetail, userId]
    );

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className="cards">
                {/* Load Log */}
                {lstTask.length > 0 &&
                    lstTask.map((lstItem) => {
                        const { lstTaskDeTail, statusId } = lstItem;
                        return (
                            <div className="task" key={statusId}>
                                <div className="task__header">
                                    {lstItem.statusName}
                                </div>
                                <Droppable droppableId={statusId}>
                                    {(provided) => {
                                        return (
                                            <div
                                                className="task__lists"
                                                key={statusId}
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {/* Load Task Item in Log */}
                                                {lstTaskDeTail.length > 0 &&
                                                    lstTaskDeTail.map(
                                                        (
                                                            lstTaskDeTailItem,
                                                            index
                                                        ) => {
                                                            const priority =
                                                                lstTaskDeTailItem
                                                                    ?.priorityTask
                                                                    ?.priority;
                                                            const {
                                                                taskId: id,
                                                                taskName,
                                                                assigness:
                                                                    members,
                                                                taskTypeDetail:
                                                                    {
                                                                        id: typeId,
                                                                    },
                                                            } = lstTaskDeTailItem;

                                                            return (
                                                                <Draggable
                                                                    key={id}
                                                                    index={
                                                                        index
                                                                    }
                                                                    draggableId={id.toString()}
                                                                >
                                                                    {(
                                                                        provided
                                                                    ) => {
                                                                        return (
                                                                            <div
                                                                                ref={
                                                                                    provided.innerRef
                                                                                }
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className="task__item"
                                                                                onClick={() => {
                                                                                    dispatch(
                                                                                        updateTaskDetail(
                                                                                            lstTaskDeTailItem
                                                                                        )
                                                                                    );
                                                                                    setVisible(
                                                                                        true
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <TaskLists
                                                                                    data={{
                                                                                        taskName,
                                                                                        priority,
                                                                                        members,
                                                                                        typeId,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </Draggable>
                                                            );
                                                        }
                                                    )}
                                                {provided.placeholder}
                                            </div>
                                        );
                                    }}
                                </Droppable>
                            </div>
                        );
                    })}
            </div>
        </DragDropContext>
    );
}

export default ProjectDetailBody;
