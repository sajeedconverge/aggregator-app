import { HttpHeaders } from "@angular/common/http";
import { SpotifySettings } from "../spotify/shared/models/spotify-models";
import { StravaSettings } from "../strava/shared/models/strava-models";

export class Constants {

    public static baseServerUrl: string = 'https://localhost:44354/api/v1';
    // public static baseServerUrl: string = 'https://aggregatorwebapi.azurewebsites.net/api/v1';

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

    // public static getTrackEndTime(endTime: string, duration_ms: number): string {
    //     // Convert endTime to a Date object
    //     const endDate = new Date(endTime);
    //     // Subtract the duration from the endDate
    //     const startDate = new Date(endDate.getTime() + duration_ms);
    //     // Convert the resulting Date object back to an ISO string
    //     return startDate.toISOString();
    // }

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



    public static getStartingDistance(
        activityStartTime: string,
        activityEndTime: string,
        trackStartTime: string,
        trackEndTime: string,
        distanceStream: any
    ): number {
        //debugger;
        var timeDifferenceInSeconds = 0;
        // Parse the input times
        const activityStart = new Date(activityStartTime).getTime();
        //const activityEnd = new Date(activityEndTime).getTime();
        const trackStart = new Date(trackStartTime).getTime();
        //const trackEnd = new Date(trackEndTime).getTime();
        // Calculate the time difference between activityStartTime and trackStartTime in seconds
        if (trackStart > activityStart) {
            timeDifferenceInSeconds = (trackStart - activityStart) / 1000;
        } else {
            timeDifferenceInSeconds = (activityStart - trackStart) / 1000;
        }

        // Use Math.ceil to round up to the next whole number
        const index = Math.ceil(timeDifferenceInSeconds);
        // Get the distance at the calculated index
        const startingDistance = distanceStream.data[index];
        return startingDistance;
    }


    public static getEndingDistance(
        activityStartTime: string,
        activityEndTime: string,
        trackStartTime: string,
        trackEndTime: string,
        distanceStream: any
    ): number {
        //debugger;
        var endingDistance = 0;
        // Parse the input times
        const activityStart = new Date(activityStartTime).getTime();
        const activityEnd = new Date(activityEndTime).getTime();
        const trackEnd = new Date(trackEndTime).getTime();
        // Determine the end time to be used (the lesser of activityEndTime and trackEndTime)
        const effectiveEndTime = Math.min(activityEnd, trackEnd);
        // Calculate the time difference between activityStartTime and effectiveEndTime in seconds
        const timeDifferenceInSeconds = (effectiveEndTime - activityStart) / 1000;
        // Use Math.ceil to round up to the next whole number
        const index = Math.ceil(timeDifferenceInSeconds);
        if (index >= distanceStream.data.length) {
            endingDistance = distanceStream.data[distanceStream.data.length - 1];
        } else {
            endingDistance = distanceStream.data[index];
        };
        // Get the distance at the calculated index
        //console.log(endingDistance);
        return endingDistance;

    }


    public static processStreams(activityStartTime: string, distanceStream: any, timeStream: any): any[] {
        const result: { time: string, distance: number }[] = [];
        let currentTime = new Date(activityStartTime).getTime(); // Convert start time to milliseconds

        for (let i = 0; i < timeStream.data.length; i++) {
            if (i > 0) {
                // const timeDifference = timeStream.data[i] - timeStream.data[i - 1];
                currentTime += timeStream.data[i] * 1000; // Convert seconds to milliseconds and add to current time
            }

            result.push({
                time: new Date(currentTime).toISOString(),
                distance: distanceStream.data[i]
            });
        }
        return result;
    }


    public static findNearestTime(array: { time: string, distance: number }[], timeStamp: string): { time: string, distance: number } | null {
        if (!array || array.length === 0) {
          return null;
        }
    
        let nearestElement = array[0];
        let nearestDifference = Math.abs(new Date(timeStamp).getTime() - new Date(array[0].time).getTime());
    
        array.forEach(element => {
          const difference = Math.abs(new Date(timeStamp).getTime() - new Date(element.time).getTime());
          if (difference < nearestDifference) {
            nearestDifference = difference;
            nearestElement = element;
          }
        });
    
        return nearestElement;
      }

}