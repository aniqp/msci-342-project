import React from 'react';
import { Grid, Typography } from "@material-ui/core";
import { useParams } from 'react-router-dom';
import SideBar from './Sidebar';
import AnnouncementPost from './AnnouncementPost';
import AnnouncementForm from './AnnouncementForm.js';
import Members from './Members';
import { makeStyles } from "@material-ui/core/styles";
import { useUser } from '../Firebase';
import { serverURL } from '../../constants/config'


const useStyles = makeStyles((theme) => ({
    clubTitle:{
        fontWeight:'600'
    },

}));

const ClubMain = () => {
    const classes = useStyles();
    const [admin, setAdmin] = React.useState(false);

    const user = useUser();

    React.useEffect(() => {
        console.log('changing users')
        if (user) {
            console.log(user)
            let userID = user.uid;
            console.log(userID)
            getUserRole(userID);
        } else {
            setAdmin(false);
        }
    }, [user]);

    React.useEffect(() => {
        if (user) {
            console.log(user)
            let userID = user.uid;
            console.log(userID)
            getUserRole(userID);
        } else {
            setAdmin(false);
        }
    }, []);

    const getUserRole = (userID) => {
        callApiGetUserRole(userID)
            .then(res => {
                console.log('hello')

                var parsed = JSON.parse(res.express);
                if (parsed.length >= 1){
                    if (parsed[0].role === 'owner' || parsed[0].role === 'admin'){
                        setAdmin(true);
                    }
                } else {
                    setAdmin(false);
                }
                console.log(parsed);
            })
    }

    const callApiGetUserRole = async (userID) => {
        const url = serverURL + '/api/getCurrentUserRole';
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //authorization: `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                clubID: clubID,
                userID: userID,
            })
        });

        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }
    
    const { clubID } = useParams();
    const [clubTitle, setClubTitle] = React.useState();
    const [clubAnnouncements, setClubAnnouncements] = React.useState([]);
    const [members, setMembers] = React.useState([]);

    const [toggle, setToggle] = React.useState("1");
    
    const handleToggle = (event, newToggle) => {
        if (newToggle !== null) {
            setToggle(newToggle);
        }
    };

    React.useEffect(() => {
        getClubAnnouncements();
        getClubTitle();
        getClubMembers();
    }, []);

    const getClubTitle = () => {
        callApiGetClubs()
            .then(res => {
                var parsed = JSON.parse(res.express);
                setClubTitle(parsed[0].name)
            })
    }

    const callApiGetClubs = async () => {
        const url = serverURL + '/api/getClubs';
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //authorization: `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                clubID: clubID
            })
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }

    // FETCH CLUB ANNOUNCEMENTS
    const getClubAnnouncements = () => {
        console.log('updating announcements');
        callApiGetClubAnnouncements()
            .then(res => {
                var parsed = JSON.parse(res.express);
                setClubAnnouncements(parsed);
                // console.log(clubAnnouncements);
            })
    }

    const callApiGetClubAnnouncements = async () => {
        const url = serverURL + '/api/getClubAnnouncements';
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //authorization: `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                clubID: clubID
            })
        });

        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }

    // FETCH CLUB MEMBERS
    const getClubMembers = () => {
        console.log('getting members');
        callApiGetClubMembers()
            .then(res => {
                var parsed = JSON.parse(res.express);
                setMembers(parsed);
            })
    }


    const callApiGetClubMembers = async () => {
        const url = serverURL + '/api/getClubMembers';
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //authorization: `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                clubID: clubID
            })
        });

        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }

    return (
        <Grid
            container
            className={classes.root}
            >
                <Grid item xs={12} style={{background:'rgba(18, 28, 38, 0.05)', padding:'60px'}}>
                    <Typography className={classes.clubTitle} variant='h5'>{clubTitle}</Typography>
                </Grid>
                <Grid item xs={8} style={{paddingTop:0}}>
                    {toggle === '1' && <>
                        {(clubAnnouncements.length > 0) ? (<>
                            {Object.values(clubAnnouncements).map((announcement, index) => (
                                <li key={announcement.id} style={{listStyle:'none'}}>
                                    <AnnouncementPost 
                                        id={announcement.id} 
                                        name={clubTitle} 
                                        title={announcement.title} 
                                        body={announcement.body} 
                                        timestamp={announcement.time_posted}
                                        onChange={getClubAnnouncements}
                                        adminStatus={admin}/>
                                </li>))}
                        </> ) : (
                        <Grid container style={{display:'flex', justifyContent:'center', padding:'30px 0'}}>
                            <Typography variant={'h6'}><b>No Announcements</b></Typography>
                        </Grid>
                        )}</>}
                    {toggle === '4' &&
                        <Typography>
                            <Members name={clubTitle} members={members} />
                        </Typography>
                    } 
                </Grid>
                <Grid item xs={4} style={{padding:'0px'}}>
                    <SideBar value={toggle} handleToggle={handleToggle} />
                    {(toggle === '1' && admin) && <AnnouncementForm clubID={clubID} onSubmit={getClubAnnouncements} />}
                </Grid>
            </Grid>
    )
}

export default ClubMain;