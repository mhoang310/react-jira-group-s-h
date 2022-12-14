import {toast} from 'react-toastify';
import { ACCESSTOKEN, http } from '../../apis/index';
import {
    checkTokenURL,
    getAllProjectURL,
    getProjectDetailURL,
    registerURL,
    signInURL,
    updateProjectURL,
    deleteProjectURL,
    createTaskURL,
    getTaskDetailURL,
    assignUserProjectURL,
    getUserAddProjectURL,
    updateTaskURL,
    removeTaskURL,
    removeUserFromProjectURL,
    getAllUsersManagementURL,
    deleteUserManageURL,
} from '../../apis/apiURL';

import {
    loginFailed,
    loginSuccess,
    registerUserFailed,
    registerUserSuccess,
} from '../reducer/userSlice';

import {
    createTaskProjectDetail,
    deleteTaskProjectDetail,
    getProjectDetailFailure,
    getProjectDetailSuccess,
} from '../reducer/projectDetailSlice';
import { delProject, gettAllProject } from '../reducer/projectSlice';
import { closeModal } from '../reducer/modalAdjustSlice';
import { updateTaskDetail } from '../reducer/taskDetailSlice';

//Login
export const loginThunk = (userInfo, navigate) => {
    return async (dispatch) => {
        try {
            const response = await http.post(signInURL, userInfo);
            const { content } = response.data;

            localStorage.setItem(ACCESSTOKEN, JSON.stringify(content));
            dispatch(loginSuccess(content));
            toast.success('Login Successfully', {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            navigate('/');
        } catch (err) {
            dispatch(loginFailed());
            toast.error('Email/Password Not Correct!', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
};

//Register Account
export const registerThunk = (userInfo, onClick) => {
    return async (dispatch) => {
        try {
            const response = await http.post(registerURL, userInfo);

            const { content } = response.data;

            const { email } = content;
            dispatch(registerUserSuccess(email));
            toast.success('Register Successfully', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            onClick();
        } catch (err) {
            dispatch(registerUserFailed());            
            toast.error('Cannot Register Account ', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
};

//Check if user is logged in
export const checkTokenThunk = (userData) => {
    return async (dispatch) => {
        try {
            await http.post(checkTokenURL);
        } catch (err) {
            if (err.response?.data?.message === '????ng nh???p th??nh c??ng!') {
                dispatch(loginSuccess(userData));
            } else {
                localStorage.removeItem(ACCESSTOKEN);
            }
        }
    };
};

//Call api for project management
export const getListProjectAction = () => {
    return async (dispatch) => {
        try {
            let result = await http.get(getAllProjectURL);
            const action = gettAllProject(result.data.content);
            dispatch(action);
        } catch (error) {
            console.log(error);
        }
    };
};

//Get Project Detail
export const getProjectDetailThunk = (projectID) => {
    return async (dispatch) => {
        try {
            const response = await http.get(
                getProjectDetailURL + `?id=${projectID}`
            );

            dispatch(getProjectDetailSuccess(response.data.content));
        } catch (err) {
            toast.error(err.response.data.message, {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });            
            dispatch(getProjectDetailFailure());
        }
    };
};
//Update project
export const updateProjectAction = (projectID) => {
    return async (dispatch) => {
        try {
            const result = await http.put(
                updateProjectURL + `?projectId=${projectID}`
            );
            dispatch({
                type: 'UPDATE_PROJECT',
                data: result.data.content,
            });
        } catch (error) {
            toast.error('Cannot update project. Please try again later !', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });            
        }
    };
};

//Delete project in project management
export const deleteProjectAction = (projectID) => {
    return async (dispatch) => {
        try {
            await http.delete(`${deleteProjectURL}?projectId=${projectID}`);

            const actionDelete = delProject(projectID);
            dispatch(actionDelete);
            toast.success('Delete Project Successfully', {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            toast.error('Cannot delete project. Please try again later !', {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });            
        }
    };
};
//Create Task Thunk
export const createTaskThunk = (taskInfo) => {
    return async (dispatch) => {
        try {
            const response = await http.post(createTaskURL, taskInfo);

            const getTaskDetail = await http.get(
                `${getTaskDetailURL}?taskId=${response.data.content.taskId}`
            );
            dispatch(createTaskProjectDetail(getTaskDetail.data.content));
            dispatch(closeModal());
            toast.success('Create Task Successfully', {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (err) {
            toast.error(err.response.data.content, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
};

//Update Task Detail
export const updateTaskDetailThunk = (taskInfo, actions, callback) => {
    return async (dispatch) => {
        try {
            const response = await http.post(`${updateTaskURL}`, taskInfo);
            const getTaskDetail = await http.get(
                `${getTaskDetailURL}?taskId=${response.data.content.taskId}`
            );
            dispatch(actions(getTaskDetail.data.content));
            dispatch(updateTaskDetail(getTaskDetail.data.content));
            if (callback) callback(getTaskDetail.data.content);
        } catch (err) {
            toast.error('Cannot Update Task Detail !');
        }
    };
};

//Update Task Detail
export const deleteTaskDetailThunk = (taskId, statusId, setVisibleModal) => {
    return async (dispatch) => {
        try {
            await http.delete(`${removeTaskURL}?taskId=${taskId}`);
            dispatch(deleteTaskProjectDetail({ taskId, statusId }));
            setVisibleModal(false);
            toast.success('Remove Task Successfully !');
        } catch (err) {
            toast.error('Cannot Remove Task !');
        }
    };
};

//Get user to add to project
export const getUserAction = (user) => {
    return async (dispatch) => {
        const result = await http.get(`${getUserAddProjectURL}?keyword=${user}`);
        dispatch({
            type: 'ADD_SEARCH_USER',
            user: result.data.content,
        });
        try {
        } catch (error) {
            toast.error(error.response.data.message, {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
};

//Get user for user management
export const getAllUserAction = () => {
    return async (dispatch) => {
        try {
            const result = await http.get(getAllUsersManagementURL);
            dispatch({
                type: 'GET_ALL_USER',
                users: result.data.content,
            });
        } catch (error) {
            toast.error('Cannot load users !', {
                autoClose: 1000,
            });            
        }
    };
};

//Delete user from user management
export const deleteUserManageAction = (userId) => {
    return async (dispatch) => {
        try {
            await http.delete(`${deleteUserManageURL}?id=${userId}`);
            dispatch({
                type: 'DELETE_USER',
                userId: userId,
            });
            toast.success('Delete User Successfully!', {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            toast.error('Cannot delete user!');
        }
    };
};

//Asign User to project
export const assignUserAction = (userInfo) => {
    return async (dispatch) => {
        try {
            await http.post(assignUserProjectURL, userInfo);
            const action = getListProjectAction();
            dispatch(action);
        } catch (error) {
            toast.error(error.response.data.message, {
                position: 'top-right',
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
};
//Remove user from project
export const removeUserFromProjectAction = (userInfo) => {
    return async (dispatch) => {
        try {
            await http.post(removeUserFromProjectURL, userInfo);
            const action = getListProjectAction();
            dispatch(action);
        } catch (error) {
            toast.error('Cannot delete this user !', {
                autoClose: 1000,
            });
        }
    };
};
