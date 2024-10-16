import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import devStore from '../../store/devStore';
import './WatchVideo.scss';
import image1 from '../../assets/video1_thumbnail.jpg'
import useVideosStore from '../../store/useVideosStore';
import { Outlet } from 'react-router-dom';
import Navbar from './components/NavMangeVideo/Sidebar';
import SearchBar from './components/ManageSearchBar/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faThumbsUp } from '@fortawesome/free-solid-svg-icons'; // Example icons 
import {faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'; 
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {faSort } from '@fortawesome/free-solid-svg-icons'; // Example icons
import useStore from '../../store/userStore';
import useCommentsStore from '../../store/useCommentsStore'
import useSubscriptionStore from '../../store/useSubscriptionStore';
import useLikesStore from '../../store/useLikesStore';
import { useForm } from 'react-hook-form';




function WatchVideo() {

    const { isNavOpen } = devStore();

    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [commentsUpdated, setCommentsUpdated] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isSubscribed,setIsSubscribed] = useState(false);
    const [channelId, setChannelId] = useState(null);
    const [isVideoLiked,setIsVideoLiked] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(null);
    const [isEditComment,setIsEditComment] = useState(false);
    const [currentComment, setCurrentComment] = useState();
    
    const { register, handleSubmit, reset } = useForm();

    const { 
        video, 
        getVideoById, 
        isLoading, 
        error, 
        userWatchHistory, 
        incrementVideoViews,
        getAllVideos,
        videos 
    } = useVideosStore(); // Fetch the video from the store

    const {user} = useStore();
    const location = useLocation();
    const { 
        commentsOfVideo,
        getVideoComments,
        addCommentOnVideo,
        deleteCommentOnVideo,
        updateCommentOnVideo,
    } = useCommentsStore();

    const {
        getUserChannelSubscribers, 
        channelSubscribers,
        toggleSubscription, 
        error:subscriptionError
    } = useSubscriptionStore();
    
    const {
        toggleVideoLike, 
        getVideoLikes,
        likesOfVideo,
        likesOfVideoNumber, 
        likesOfComments,
        toggleCommentLike, 
        getLikesOfComment,
        setCurrentUserId,
    } = useLikesStore();

    // useEffect(()=>{
    //     if(user && user?._id){
    //         setCurrentUserId(user._id);
    //     }
    // })

    const queryParams = new URLSearchParams(location.search);
    const videoId = queryParams.get('videoId');
    useEffect(() => {
        const fetchData =async()=>{
            if (videoId) {
                await userWatchHistory(videoId);
                await getVideoById(videoId);
                await incrementVideoViews(videoId);
                await getVideoComments(videoId);
                await getAllVideos();
                await getVideoLikes(videoId);

                const channelId = await video?.owner?._id;
                if(video?.owner?._id){
                    setChannelId(video.owner._id);
                    await getUserChannelSubscribers(channelId);
                }

                // Fetch likes for each comment
                if (commentsOfVideo && commentsOfVideo.length > 0) {
                    for (const comment of commentsOfVideo) {
                        await getLikesOfComment(comment._id);
                    }
                }
            }
        };
        fetchData();
    }, [
        videoId,
        channelId,
        getVideoById,
        userWatchHistory,
        incrementVideoViews,
        getVideoComments,
        commentsUpdated,
        getAllVideos,
        getUserChannelSubscribers,
        getVideoLikes,
        getLikesOfComment,
    ]);

    useEffect(() => {
        if (channelSubscribers.length > 0 && user) {
            const isUserSubscribed = channelSubscribers.some(
                (subscriber) => subscriber._id === user._id
            );
            setIsSubscribed(isUserSubscribed);
        }

        if (likesOfVideoNumber > 0 && user) {
            const isVideoLiked = likesOfVideo.some(
                (u) => u.likedBy === user._id
            );
            setIsVideoLiked(isVideoLiked);
        }
    }, [channelSubscribers, user, likesOfVideoNumber, likesOfVideo]);

    const handleAddComment = async()=>{
        if(videoId && commentContent){
            await addCommentOnVideo(videoId,commentContent);
            setCommentContent('');
            setCommentsUpdated((prev) => !prev);
        }
    }

    const handleSubscription = async () => {
        if (channelId) {
            await toggleSubscription(channelId);
            if(isSubscribed){
                channelSubscribers.length -= 1;
            }else{
                channelSubscribers.length += 1;
            }
            setIsSubscribed((prev) => !prev);
        }
    };

    const handleVideoLike = async()=>{
        if(videoId){
            await toggleVideoLike(videoId);
            await getVideoLikes(videoId);
            // if(isVideoLiked){
            //     likesOfVideoCount -= 1;
            // }
            // else{
            //     likesOfVideoCount += 1;
            // }
            setIsVideoLiked((prev)=> !prev);
        }
    };

    useEffect(() => {
        if (user && user._id) {
            setCurrentUserId(user._id);
        }
    }, [user, 
        setCurrentUserId, 
        toggleCommentLike,
        getLikesOfComment,
        // commentsOfVideo,
    ]);
    
    const handleCommentLike = async (commentId) => {
        if (commentId) {
            // console.log(likesOfComments)
            await toggleCommentLike(commentId);
            await getLikesOfComment(commentId);
            // setIsVideoLiked((prev) => !prev);
        }
    };

    const toggleDropdown = (commentId) => {
        setIsDropdownOpen((prev) => (prev === commentId ? null : commentId));
    };

    const handleCommentDelete = async(commentId) =>{
        await deleteCommentOnVideo(commentId);
        setCommentsUpdated((prev) => !prev); // Trigger refetch after deletion

    }

    const handleCommentEdit = (comment)=>{
        setIsEditComment(true);
        setCurrentComment(comment);
    }

    const onSubmit = async(data)=>{ 
        try {
            // console.log(data.content)
            await updateCommentOnVideo(currentComment?._id,{content: data.content});
            reset();
            setIsEditComment(false);
            setCommentsUpdated((prev) => !prev); // Trigger refetch after deletion

        } catch (error) {
            console.error("Error while updating the comment !!")
        }
    };

    const handleCloseEdit = ()=>{
        setIsEditComment(false);
        reset();
    }
    if (isLoading) return <p>Loading video...</p>;
    if (error) return <p>Error: {error}</p>;

    dayjs.extend(relativeTime);

    return (
        <>
        <div className='box'>
            <div className='watchVideo-container'>
                <div className='watchVideo-left-side'>
                    <div>
                        {video ? (
                            <video
                                ref={videoRef}
                                src={video?.videoFile}
                                controls
                                style={{ borderRadius: '10px' }}
                            />
                        ) : (
                            <p>No video found.</p>
                        )}
                        {/* <button onClick={togglePlayPause}>
                            {isPlaying ? 'Pause' : 'Play'}
                        </button> */}
                    </div>
                    <div>
                        <p className='video-title'>{video ? video?.title : 'Video Title Here'}</p>
                    </div>
                    <div className='subscribeSection'>
                        <div className='section1'>
                            <div className='section11'>
                                <div className='section111'>
                                    <img src={video?.owner?.avatar} alt="" />
                                </div>
                                <div className='section112'>
                                    <p className='ownerName'>{video?.owner?.fullName}</p>
                                    <p className='ownerSubscribers'>{channelSubscribers.length}</p>
                                </div>
                            </div>
                            <div className='section12'>
                                <button 
                                    className='subscribeButton'
                                    onClick={handleSubscription}
                                >
                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>

                                <div className='likeButton'>
                                    <FontAwesomeIcon 
                                        icon={faThumbsUp} 
                                        onClick={handleVideoLike}
                                        className={`${isVideoLiked ? 'likeIcon' : 'unLikeIcon'}`}
                                    />
                                    <p>{likesOfVideoNumber}</p>
                                </div>
                            </div>
                        </div>
                        {/* <div className='section2'>
                            <button>

                            </button>

                        </div> */}
                    </div>
                    <div className='description'>
                        <div className='section21'>
                            <p className='views'>{video?.views} views</p>
                            {/* <p className='dot'>•</p> */}
                            <p className='time'>{dayjs(video?.createdAt).fromNow()}</p>
                        </div>
                        <div className='section22'>
                            <p className='section221'>Description</p>
                            <p className='descriptionContent'>{video?.description}</p>
                        </div>
                    </div>
                    <div className='commentSection'>
                        <div className='commentSection1'>
                            <p className='commentSection12'>{commentsOfVideo?.length} Comments</p>
                        </div>
                        <div className='commentSection2'>
                            <FontAwesomeIcon icon={faSort} />
                            <p className='commentSection21'>Sort by</p>
                        </div>
                    </div>
                    <div className='comments'>
                        <div className='comments1'>
                            <div className='comments11'>
                                <img src={user?.avatar} alt="" />
                                <input 
                                    type="text"
                                    placeholder='Add a Comment'
                                    value={commentContent}
                                    onChange={(e)=>setCommentContent(e.target.value)}
                                />
                                <button 
                                    onClick={()=>setCommentContent('')}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddComment}
                                    disabled={!commentContent.trim()}
                                >
                                    Comment
                                </button>
                            </div>
                            <div className='divider'>

                            </div>
                        </div>
                        {/* <div className='comments2'>
                        </div> */}
                    </div>
                    <div className='channelComments'>
                        {
                            commentsOfVideo && commentsOfVideo.length > 0 ?
                            commentsOfVideo.map((comment)=>{
                                const commentLikeData =
                                // console.log(likesOfComments)
                                    likesOfComments[comment._id] ||{
                                        likes:0,
                                        likedbyUser:false,
                                    };
                                    // console.log(commentLikeData);
                                    // console.log(commentLikeData)
                                    // console.log(commentLikeData.likedByUser)
                                    // console.log(comment?.owner)
                                    // console.log(video?.owner?._id)
                                    // console.log(channelId)
                                    // console.log(user?._id)
                                    // console.log(user?._id)
                                    // console.log(currentComment)
                                return(
                                    <div key={comment?._id} className='channelCommentsSection'>
                                        <div className='channelCommentsSection1'>
                                            <img src={comment?.owner?.avatar} alt="" />
                                        </div>
                                        <div className='channelCommentsSection2'>
                                            <div className='channelCommentsSection21'>
                                                <p className='channelCommentsSection211'>{comment?.owner?.username}</p>
                                                <p className='channelCommentsSection212'>{dayjs(comment?.createdAt).fromNow()}</p>
                                                <FontAwesomeIcon 
                                                    icon={faEllipsisVertical} 
                                                    className='channelCommentsSection213' 
                                                    onClick={()=>toggleDropdown(comment._id)}
                                                />
                                                {isDropdownOpen === comment._id && (comment?.owner?._id === user?._id || channelId === user?._id)  &&( // Conditionally render dropdown
                                                    <div className='commentDropdown'>
                                                        <button onClick={() => handleCommentEdit(comment)}>Edit</button>
                                                        <button onClick={()=>handleCommentDelete(comment?._id)}>Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className='channelCommentsSecton22'>
                                                <p className='channelCommentsSection212'>{comment?.content}</p>
                                            </div>
                                            <div className='channelCommensSection23'>
                                                <div className='channelCommensSection231'>
                                                    <FontAwesomeIcon
                                                        icon={faThumbsUp} 
                                                        className={`${
                                                            commentLikeData.likedByUser
                                                                ? 'likeIcon'
                                                                : 'unLikeIcon'
                                                        }`}
                                                        onClick={()=>
                                                            handleCommentLike(
                                                                comment?._id
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <p>{commentLikeData.likes}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    );
                                }) 
                                :
                            <p>No Comments</p>
                        }
                    </div>
                    
                </div>

                <div className='watchVideo-right-side'>
                    {videos.length > 0 && videos.map((video, index) => (
                        video?._id != videoId && (
                            <div key={index} className='watchVideoSection'>
                                <div className='watchVideoSection1'>
                                    <img src={video?.thumbnail} className='watchVideoSection11' alt="" />
                                </div>
                                <div className='watchVideoSection2'>
                                    <div className='watchVideoSection21'>
                                        <p className='watchVideoSection211'>{video?.title}</p>
                                    </div>
                                    <div className='watchVideoSection22'>
                                        <p className='watchVideoSection221'>{video?.owner?.username}</p>
                                    </div>
                                    <div className='watchVideoSection23'>
                                            <p className='views'>{video?.views} views</p>
                                            <p className='dot'>•</p>
                                            <p className='time'>{dayjs(video?.createdAt).fromNow()}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
        {isEditComment && currentComment?.owner?._id === user?._id &&(
            <div className='editCommentContainer'>
                <form onSubmit={handleSubmit(onSubmit)} className='editCommentContainer1'>
                    <p className='editCommentContainer11'>Edit Comment</p>
                    <div className='editCommentContainer12'>
                        <label className='editCommentContainer121'>
                            Content
                        </label>
                        <input 
                            type="text" 
                            {...register('content')}
                            defaultValue={currentComment.content}
                            className='editCommentContainer122'
                        />
                    </div>
                    <div className="formButtons">
                                <button type="submit">Submit</button>
                                <button type="button" onClick={handleCloseEdit}>Close</button>
                    </div>
                </form>
            </div>
        )}
        
    </>


    );
}

export default WatchVideo;



