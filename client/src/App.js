import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate } from "react-router-dom";

import LayoutPage from "./Layout/LayoutPage";
import HomePage from './Features/Homepage/HomePage';
import UserChannel from "./Features/UserChannel/UserChannelTemplate/UserChannel";
import UserPlaylist from "./Features/UserChannel/UserPlaylist/userPlaylist";
import UserCommunity from "./Features/UserChannel/UserCommunity/UserCommunity";
import WatchVideo from './Features/WatchVideo/WatchVideo'
import LoginPage from "./Features/Authentication/LoginPage/LoginPage";
import RegistrationPage from "./Features/Authentication/RegistrationPage/RegistrationPage";
import ManageVideos from './Features/ManageVideos/ManageVideos'
import WatchHistory from "./Features/WatchHistory/WatchHistory";
import Subscriptions from "./Features/Subscriptions/Subscriptions";
import UserVideos from "./Features/UserChannel/UserVideos/UserVideos";
import UserLive from "./Features/UserChannel/UserLive/UserLive";
import LikedVideos from "./Features/LikedVideos/LikedVideos";
import ViewPlaylist from "./Features/UserChannel/UserPlaylist/ViewPlaylist/ViewPlaylist";
import Community from "./Features/Community/Community";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegistrationPage />} />
            <Route path='/channel' element={<ManageVideos />} />
            <Route path='/' element={<LayoutPage />}>
                <Route path='' element={<HomePage />} />
                <Route path='userchannel/:channelId' element={<UserChannel />} >
                    <Route path='' element={<Navigate to='videos' replace />} />
                    <Route path='playlist' element={<UserPlaylist />} >
                        <Route path=':playlistId' element={<ViewPlaylist />} />
                    </Route>
                    <Route path='community' element={<UserCommunity />} />
                    <Route path='videos' element={<UserVideos />} />
                    <Route path='live' element={<UserLive />} />
                </Route>
                <Route path='likedvideos' element={<LikedVideos />} />
                <Route path='subscription' element={<Subscriptions />} />
                <Route path='/watch-history' element={<WatchHistory/>}/>
                <Route path='watchvideo' element={<WatchVideo />} />
                <Route path='/community/:channelId' element={<Community />} />
            </Route>
            
        </>
    )
);

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;
