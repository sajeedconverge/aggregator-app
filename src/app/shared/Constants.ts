import { HttpHeaders } from "@angular/common/http";
import { SpotifySettings } from "../spotify/shared/models/spotify-models";
import { StravaSettings } from "../strava/shared/models/strava-models";

export class Constants {

    public static baseServerUrl: string = 'https://localhost:44354/api/v1';
    //public static baseServerUrl: string = 'https://aggregatorwebapi.azurewebsites.net/api/v1';

    //public static isLoggedInFlag: boolean = false;


    public static spotifySettings: SpotifySettings = {
        clientId: "",
        clientSecret: "",
        scopes: "",
        redirectClientUrl: ""
    }

    public static stravaSettings: StravaSettings = {
        clientId: 0,
        clientSecret: "",
        redirectClientUrl: "",
        scope: ""
    }



    public static spotifyHeader = new HttpHeaders({});

    public static stravaHeader = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    //To calculate the starting time of played track
    public static getTrackStartTime(endTime: string, duration_ms: number): string {
        // Convert endTime to a Date object
        const endDate = new Date(endTime);
        // Subtract the duration from the endDate
        const startDate = new Date(endDate.getTime() - duration_ms);
        // Convert the resulting Date object back to an ISO string
        return startDate.toISOString();
    }


    //To calculate the end time of the activity
    public static getActivityEndTime(startDate: string, elapsed_time: number): string {
        // Convert startDate to a Date object
        const startDateObj = new Date(startDate);
        // Add the elapsed time (in seconds) to the startDate
        const endDateObj = new Date(startDateObj.getTime() + elapsed_time * 1000);
        // Convert the resulting Date object back to an ISO string
        return endDateObj.toISOString();
    }

    //To convert duration in ms to minutes
    public static formatDuration(ms: number): string {
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

        let hoursStr = (hours < 10) ? "0" + hours : hours;
        let minutesStr = (minutes < 10) ? "0" + minutes : minutes;
        let secondsStr = (seconds < 10) ? "0" + seconds : seconds;

        return hoursStr + ":" + minutesStr + ":" + secondsStr;
    }

    //To combine time stream and distance streams data and crete a timestampped data array 
    public static processStreams(activityStartTime: string, distanceStream: any, timeStream: any): any[] {
        const result: any[] = [];
        let currentTime = new Date(activityStartTime).getTime(); // Convert start time to milliseconds
        //debugger;
        for (let i = 0; i < timeStream.data.length; i++) {
            if (i > 0) {
                // const timeDifference = timeStream.data[i] - timeStream.data[i - 1];
                currentTime += timeStream.data[i] * 1000; // Convert seconds to milliseconds and add to current time
            };

            result.push({
                time: new Date(currentTime).toISOString(),
                distance: distanceStream.data[i],
                duration_increment_ms: (timeStream.data[i] * 1000),
                index: i
            });
        }
        return result;
    }

    //to find the matching element of the stream with the given start time of the track
    public static findNearestStartTime(array: any[], timeStamp: string): any | null {
        // debugger;
        if (!array || array.length === 0) {
            return null;
        };
        let nearestElement = array[0];
        let nearestDifference = Math.abs(new Date(timeStamp).getTime() - new Date(array[0].time).getTime());
        array.forEach(element => {
            const difference = Math.abs(new Date(timeStamp).getTime() - new Date(element.time).getTime());
            if (difference < nearestDifference) {
                nearestDifference = difference;
                nearestElement = element;
            };
        });
        return nearestElement;
    }

    //to find the matching element of the stream with the given end time of the track
    public static findNearestEndTime(array: any[], startTime: string, endTime: string): any | null {
        // debugger;
        if (!array || array.length === 0) {
            return null;
        };
        let nearestElement = array[0];
        let nearestDifference = Math.abs(new Date(endTime).getTime() - new Date(startTime).getTime());
        array.forEach(element => {
            const difference = Math.abs(new Date(endTime).getTime() - new Date(element.time).getTime());
            if (difference < nearestDifference) {
                nearestDifference = difference;
                nearestElement = element;
            };
        });
        return nearestElement;
    }

    //private method to check that the given date lies between startDate and EndDate
    static isDateBetween(date: string, startDate: string, endDate: string): boolean {
        const targetDate = new Date(date).getTime();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return targetDate >= start && targetDate <= end;
    }

    
    public static assignRecentAudioToActivity(activity: any, recentAudio: any[]): any[] {
        const audioInRange = recentAudio.filter(audio =>
            this.isDateBetween(audio.played_at, activity.start_date, activity.end_date)
        );
        return audioInRange;
    }






}