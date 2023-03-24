import React from 'react';
import { Grid, Card, Button } from "@material-ui/core";
import { Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import profile from '../../images/profile-icon.png';
import membersIcon from '../../images/members.png';
import { useUser } from '../Firebase/context';
import history from '../Navigation/history';
import userButton from './editTitleModal';
import Modal from 'react-modal';
import FormButton from './Form';

const useStyles = makeStyles((theme) => ({
    root:{
        display:'flex',
        flexDirection:'row',
        padding:'20px 10px 20px 30px',

    },
    card:{
        display:'flex',
        margin:'10px 10px',
        padding:'10px 10px',
        alignItems:'center',
        height:'75px'
    },
    header:{
        display:'flex',
        padding:'0 10px 0px 10px',
        boxShadow:'none',
        background: 'none',
    },
    profile:{
        height:'30px',
        padding:'0 15px 0 5px'
    },
    memberCount:{
        margin:'30px 0 30px 0',
        padding: '15px',
        display:'flex',
        flexDirection:'column',
        alignItems:'center'
    },
    headerFont:{
        fontWeight:'600'
        
    },
    role:{
        padding:'5px 15px',
        borderRadius:'5px',
    },
    ownerRole:{
        background:'rgba(149, 0, 204, 0.1)'

    },
    adminRole:{
        background:'rgba(255, 104, 104, 0.1)'
    },
    userRole:{
        background:'rgba(136, 191, 255, 0.1)',
    },
    text1:{
        color:'rgba(0, 0, 0, 0.6)'
    },
    text2:{
        fontWeight:'600',
        fontSize:'25pt'

    }



}));




const Members = ({name, members}) => {
    const classes = useStyles();
    const user = useUser();
    //check the role of the user in members
    console.log(user.uid)
    //const myrole = members.filter(member => member.uid === user.uid)
    //check the role of the user in members
    const myrole = members.find(member => member.uid === user.uid)
    console.log("my role", myrole.role)
    for (let i = 0; i < members.length; i++) {
        console.log("this club", members[i].club_id)
    }

    const handleClickUser = (userId, clubId) => {
        fetch('/api/promoteUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            clubId: clubId
          })
        })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error(error));
          history.push("/myclubs");
      }

      const handleClickAdmin = (userId, clubId) => {
        fetch('/api/demoteAdmin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            clubId: clubId
          })
        })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error(error));
           history.push("/myclubs");
      }

      const handleKickUser = (userId, clubId) => {
        fetch('/api/kickUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                clubId: clubId
            })
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
        history.push("/myclubs");
    }

   





    return(
        <Grid container className={classes.root}>
            <Grid item xs={3}>
                <Card className={classes.memberCount}>
                    <img src={membersIcon} style={{height:'50px'}}></img>
                    <Typography className={classes.text2} color='secondary'>{members.length}</Typography>
                    <Typography className={classes.text1} color="text.secondary">Club Members</Typography>
                </Card>
            </Grid>
            <Grid item xs={7} style={{padding:'0 0 0 60px'}}>
                {members.length > 0 && 
                <Card className={classes.header}>
                    <Grid xs={6} item>Name</Grid>
                    <Grid xs={6} item>Role</Grid>
                </Card>}
                {members.map((member) => (
                <Card className={classes.card}>
                    <Grid xs={6} item>
                        <img src={profile} className={classes.profile}></img>
                        {member.name}
                    </Grid>
                    <Grid item style={{display:'flex', justifyContent:'center'}}>
                        {member.role === 'owner' && (
                            <Typography className={[classes.role, classes.ownerRole]}> {member.role}</Typography>
                        )}
                        {member.role === 'admin' && (
                            <Typography className={[classes.role, classes.adminRole]}> {member.role}</Typography>
                        )}
                        {member.role === 'user' && (
                            <Typography className={[classes.role, classes.userRole]}> {member.role}</Typography>
                        )}
                    </Grid>
                    {myrole.role === 'owner' && (
                    <Grid item style={{display:'flex'}}>
                        {member.role === 'user' && (
                            <Button className={[classes.role, classes.adminRole]} onClick={() => handleClickUser(member.uid, member.club_id)}> Promote</Button>
                        )}
                        {member.role === 'admin' && (
                            <Button className={[classes.role, classes.ownerRole]} onClick={() => handleClickAdmin(member.uid, member.club_id)}> Demote</Button>
                        )}
                        <FormButton clubId={member.club_id} userId={member.uid} />

                    </Grid>
                    // <Grid item style={{display:'flex'}}>
                    //     <userButton className={[classes.role, classes.adminRole]} onClick={() => handleKickUser(member.uid, member.club_id)}> Kick</userButton>
                    // </Grid>
                    )}
                    {myrole.role === 'admin' && (
                        <Grid item style={{display:'flex'}}>
                            {member.role === 'user' && (
                                <Button className={[classes.role, classes.adminRole]} onClick={() => handleKickUser(member.uid, member.club_id)}> Kick</Button>
                            )}
                        </Grid>
                    )}

                </Card>
                  ))}
            </Grid>
            {/* <Grid item className={classes.memberCount}>
                <Typography>{name} has</Typography>
                &nbsp;
                <Typography color='secondary' className={classes.headerFont}>{members.length} members</Typography> 
            </Grid> */}
            
            
          
        </Grid>

    )

}
export default Members;