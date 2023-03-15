import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Card, Typography, CardActions, CardContent, CardMedia } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import history from '../Navigation/history';
import academic from '../../images/club-images/academic.jpg'
import business from '../../images/club-images/business.jpg'
import charity from '../../images/club-images/charity.jpg'
import creativeArt from '../../images/club-images/creative_art.jpg'
import cultural from '../../images/club-images/cultural.jpg'
import environmental from '../../images/club-images/environmental.jpg'
import games from '../../images/club-images/games.jpg'
import health from '../../images/club-images/health.jpg'
import media from '../../images/club-images/media.jpg'
import politicsSocialAwareness from '../../images/club-images/politics_social_awareness.jpg'
import religious from '../../images/club-images/religious.jpg'
import { useUser } from '../Firebase/context';
import { toast } from 'react-toastify'; 
import "react-toastify/dist/ReactToastify.css";
import { serverURL } from '../../constants/config';

const MyClubCard = (props) => {

    const truncate = (input) => {
        if (input.length > 100) {
            return input.substring(0, 200) + '...';
        }
        return input;
    };

    toast.configure();
    const notify = (name) => {
        toast.success("Your request to leave "+name+" was successful", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: true
        });
    }

    function getClubCategory(club) {
        const category = club.categories.split(',')[0]
        if(category == 'academic') {
            return academic 
        }
        else if (category == "business-and-entrepreneurial") {
            return business
        }
        else if (category == "charitable-community-service-international-development") {
            return charity
        }
        else if(category == "creative-arts-dance-and-music") {
            return creativeArt
        }
        else if(category == "cultural") {
            return cultural
        }
        else if(category == "environmental-and-sustainability") {
            return environmental
        }
        else if(category == "games-recreational-and-social") {
            return games
        }
        else if(category == "health-promotion") {
            return health
        }
        else if(category == "media-publications-and-web-development") {
            return media
        }
        else if(category == "political-and-social-awareness") {
            return politicsSocialAwareness
        }
        else if(category == "religious-and-spiritual") {
            return religious
        }
    }

    const user = useUser();
    
    const handleClick = (clubId, userId, clubName) => {
        let data = {
            clubId:clubId,
            userId:userId,
            clubName:clubName
        }
        
        callApiLeaveClub(data)
        .then(res => {
            props.onChange();
            notify(clubName);
        })
    };

    const callApiLeaveClub = async (data) => {
        const url = serverURL + '/api/leaveClub';
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //authorization: `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                clubId: data.clubId,
                userId: data.userId
            })
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }
        

    return (
        <Grid container spacing={2}>
            {props.clubs.map((club) => (
                    <Grid item xs={6} sm={6} med={6}>
                        <Card variant="outlined" style = {{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: 600}} >
                            <CardMedia
                                image = {getClubCategory(club)}
                                style = {{height: "125px"}}
                            >
                            </CardMedia>
                            <CardContent>
                                <Typography variant='h6' style={{ padding: '0 0 10px 0' }}>{club.name}</Typography>
                                <Typography style={{ fontSize: '0.8rem' }}>{truncate(club.description)}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button style={{ border: '1.5px solid' }} onClick={() => history.push(`/clubboard/${club.id}`)} color='primary' variant='outlined' >View Board</Button>
                                
                                <Button style={{ border: '1.5px solid' }} onClick={() => handleClick(club.id, user.uid, club.name)} color='primary' variant='outlined' >Leave Club</Button>
                            </CardActions>
                        </Card>
                    </Grid>
            ))}
        </Grid>
    )

}

export default MyClubCard;