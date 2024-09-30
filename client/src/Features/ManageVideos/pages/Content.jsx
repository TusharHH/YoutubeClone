import React, { useEffect } from 'react';

import './Content.scss';
import useVideosStore from '../../../store/useVideosStore';
import useStore from '../../../store/userStore';

import image1 from '../../../assets/user_coverImage.jpg'
function Content() {
    const { videos, getAllVideos, isLoading, error } = useVideosStore(); // Fetch videos and state from the store
    const {user}=useStore();
    // Fetch videos when the component mounts
    useEffect(() => {
        const params = {
            page: 1,
            limit: 20,
            // query: 'example search',
            // sortBy: 'date',
            // sortType: 'asc',
            userId: user.userId, // Replace with actual userId if needed
        };
        getAllVideos(params);
    }, [getAllVideos]);

    return (
        <>
            <div className='contentContainer'>
                <div className='level-1'>
                    <div className='head'>
                        <div>Channel content</div>
                    </div>
                    <div className='bttns'>
                        <div className='pressables'><button>Videos</button></div>
                        <div className='pressables'><button>Shorts</button></div>
                        <div className='pressables'><button>Live</button></div>
                        <div className='pressables'><button>Post</button></div>
                        <div className='pressables'><button>Playlists</button></div>
                        <div className='pressables'><button>Podcasts</button></div>
                        <div className='pressables'><button>Promotions</button></div>
                    </div>
                </div>
                <div className="divider"></div>

                {/* Loading and Error States */}
                {isLoading && <p>Loading videos...</p>}
                {error && <p>Error: {error}</p>}

                <div className='level-2'>
                    <div className='label'>Filter</div>
                </div>
                <div className='level-3'>
                    <div className='part-1'>
                        <div className='box'></div>
                        <div className='label'>videos</div>
                    </div>
                    <div className='part-2'>
                        <div>Visibility</div>
                        <div>Duration</div>
                        <div>Date ↓</div>
                    </div>
                    <div className='part-3'>
                        <div>Views</div>
                        <div>Comments</div>
                        <div>Likes</div>
                    </div>
                </div>
                <div className="divider"></div>

                <div className='level-4'>
                    {videos.length > 0 ? (
                        videos.map((video) => (
                            <React.Fragment key={video._id}>
                                <div className='videoContainer'>
                                    <img src={video.thumbnail || image1} alt="Thumbnail" />
                                    <div className='videoTitleDescriptionContainer'>
                                        <p>{video.title}</p>
                                        <p>{video.description}</p>
                                    </div>
                                    <div className='videoStatsContainer'>
                                        <div className='statsPart1'>
                                            <p>{video.visibility}</p>
                                            <p>{video.duration}</p>
                                            <div>
                                                <p>{new Date(video.createdAt).toLocaleDateString()}</p>
                                                <p>{video.isPublished ? "Published" : "Unpublished"}</p>
                                            </div>
                                        </div>
                                        <div className='statsPart2'>
                                            <p>{video.views}</p>
                                            <p>{video.commentsCount}</p>
                                            <p>{video.likes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="divider"></div>
                            </React.Fragment>
                        ))
                    ) : (
                        <p>No videos available.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default Content;
