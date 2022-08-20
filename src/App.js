import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';


import ProtectRoute from './pages/ProtectRoute';
import Auth from './pages/Auth/Auth';
import HomeScreen from './pages/HomeScreen/HomeScreen';
import LayoutMain from './layout/LayoutMain/LayoutMain';
import CreateProject from './pages/CreateProject/CreateProject';
import UserManagement from './pages/UserManagement/UserManagement';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Loading from './components/Loading/Loading';

import { checkTokenThunk } from './redux/thunk';
import { getUserInfo } from './redux/selectors';
import { checkTokenRequest } from './redux/reducer/userSlice';
import { ACCESSTOKEN } from './apis';
import { useWindowResize } from './hooks/useWindowResize';
import { updateViewPort } from './redux/reducer/viewPortSlice';
import AccountSetting from './pages/AccountSetting/AccountSetting';

function App() {
  const dispatch = useDispatch();
  const { isCheckToken } = useSelector(getUserInfo);
  const { width, height } = useWindowResize();

  //Check valid token if user have accessToken at local storage
  useEffect(() => {
      const userData = JSON.parse(localStorage.getItem(ACCESSTOKEN));
      if (userData) {
          dispatch(checkTokenRequest());
          const checkToken = checkTokenThunk(userData);
          dispatch(checkToken);
      }
  }, [dispatch]);

  //Update Viewport
  useEffect(() => {
      dispatch(updateViewPort({ width, height }));
  }, [dispatch, height, width]);

  return (
      <div className="App">
          {isCheckToken ? (
              <div className="view-center">
                  <Loading color="#000"></Loading>
              </div>
          ) : (
              <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route element={<ProtectRoute />}>
                      <Route element={<LayoutMain />}>
                          {/* Screens */}
                          <Route path="/" element={<HomeScreen />} />
                          <Route
                              path="/create-project"
                              element={<CreateProject />}
                          />
                          <Route
                              path="/user-management"
                              element={<UserManagement />}
                          />
                          <Route
                              path="/profile-setting"
                              element={<AccountSetting />}
                          />
                          {/* Detail Screens */}
                          <Route
                              path="/project-detail/:id"
                              element={<ProjectDetail />}
                          />
                      </Route>
                  </Route>
                  {/* Not Found Page */}
                  <Route path="*" element={<NotFoundPage />} />
              </Routes>
          )}
          
      </div>
  );
}
export default App;
