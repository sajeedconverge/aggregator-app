import { HttpHeaders } from "@angular/common/http";
import { PairedTrackJsonObject, SpotifySettings, TrackJsonObject } from "../spotify/shared/models/spotify-models";
import { ActivityDetailJsonObject, ActivityJsonObject, StravaSettings } from "../strava/shared/models/strava-models";

export class Constants {

    public static baseServerUrl: string = 'https://localhost:44354/api/v1/';
    //public static baseServerUrl: string = 'https://aggregatorwebapi.azurewebsites.net/api/v1/';

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
        var currentTime2 = currentTime;
        //debugger;
        for (let i = 0; i < timeStream.data.length; i++) {
            if (i > 0) {
                // const timeDifference = timeStream.data[i] - timeStream.data[i - 1];
                //currentTime += timeStream.data[i] * 1000; // Convert seconds to milliseconds and add to current time
                currentTime2 = currentTime + timeStream.data[i] * 1000;
            };

            result.push({
                time: new Date(currentTime2).toISOString(),
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

    //#Considers only start time of the track 
    // public static assignRecentAudioToActivity(activity: any, recentAudio: any[]): any[] {
    //     const audioInRange = recentAudio.filter(audio =>
    //         this.isDateBetween(audio.start_time, activity.start_date, activity.end_date)
    //     );
    //     return audioInRange;
    // }

    //#Considers the start time and end time of the track
    public static assignRecentAudioToActivity(activity: any, recentAudio: any[]): any[] {
        const audioInRange = recentAudio.filter(audio =>
            this.isDateBetween(audio.start_time, activity.start_date, activity.end_date) ||
            this.isDateBetween(audio.played_at, activity.start_date, activity.end_date)
        );
        return audioInRange;
    }

    public static typeCastActivityJson(activity: any): ActivityJsonObject {
        var activityJson: ActivityJsonObject = {
            id: activity.id,
            name: activity.name,
            distance: activity.distance,
            moving_time: activity.moving_time,
            elapsed_time: activity.elapsed_time,
            total_elevation_gain: activity.total_elevation_gain,
            type: activity.type,
            sport_type: activity.sport_type,
            start_date: activity.start_date,
            start_date_local: activity.start_date_local,
            timezone: activity.timezone,
            utc_offset: activity.utc_offset,
            average_speed: activity.average_speed,
            max_speed: activity.max_speed,
            average_heartrate: activity.average_heartrate,
            max_heartrate: activity.max_heartrate,
            elev_high: activity.elev_high,
            elev_low: activity.elev_low,
            upload_id: activity.upload_id,
            external_id: activity.external_id,
            suffer_score: activity.suffer_score,
            calories: activity.calories,
            end_date: activity.end_date,
            duration_mins: activity.duration_mins,
            distance_km: activity.distance_km
        };
        return activityJson;
    }

    public static typeCastActivityDetailJson(ActivityDetail: any): ActivityDetailJsonObject {
        var actvityDetailJson: ActivityDetailJsonObject = {
            id: ActivityDetail.id,
            name: ActivityDetail.name,
            distance: ActivityDetail.distance,
            moving_time: ActivityDetail.moving_time,
            elapsed_time: ActivityDetail.elapsed_time,
            total_elevation_gain: ActivityDetail.total_elevation_gain,
            type: ActivityDetail.type,
            sport_type: ActivityDetail.sport_type,
            start_date: ActivityDetail.start_date,
            start_date_local: ActivityDetail.start_date_local,
            timezone: ActivityDetail.timezone,
            utc_offset: ActivityDetail.utc_offset,
            average_speed: ActivityDetail.average_speed,
            max_speed: ActivityDetail.max_speed,
            average_heartrate: ActivityDetail.average_heartrate,
            max_heartrate: ActivityDetail.max_heartrate,
            elev_high: ActivityDetail.elev_high,
            elev_low: ActivityDetail.elev_low,
            upload_id: ActivityDetail.upload_id,
            external_id: ActivityDetail.external_id,
            suffer_score: ActivityDetail.suffer_score,
            calories: ActivityDetail.calories,
            end_date: ActivityDetail.end_date,
            audio: ActivityDetail.audio,
            duration_mins: ActivityDetail.duration_mins,
            distance_km: ActivityDetail.distance_km
        };
        return actvityDetailJson;
    }

    public static typeCastTrackJson(track: any): TrackJsonObject {
        var trackJson: TrackJsonObject = {
            album: track.track.album,
            artists: track.track.artists,
            duration_ms: track.track.duration_ms,
            id: track.track.id,
            name: track.track.name,
            popularity: track.track.popularity,
            type: track.track.type,
            uri: track.track.uri,
            audio_features: track.audio_features,
        };
        return trackJson
    }

    public static typeCastPairedTrackJson(pairedTrack: any): PairedTrackJsonObject {
        var PairedTrackJson: PairedTrackJsonObject = {
            distance: pairedTrack.distance,
            distance_end: pairedTrack.distance_end,
            distance_start: pairedTrack.distance_start,
            duration_mins: pairedTrack.duration_mins,
            moving_time: pairedTrack.moving_time,
            pace: pairedTrack.pace,
            played_at: pairedTrack.played_at,
            speed: pairedTrack.speed,
            start_time: pairedTrack.start_time,
            trackid: pairedTrack.track.id,
            //track:pairedTrack.track
        };
        return PairedTrackJson;
    }

    // Function to convert NumberLong and other non-JSON compliant elements
    public static convertToValidJson(jsonString: string): any {
        // Replace `NumberLong` and similar patterns
        const validJsonString = jsonString.replace(/NumberLong\(["']?(\d+)["']?\)/g, (match, p1) => {
            return p1; // replace with the numeric value
        });

        // Parse the cleaned string
        try {
            return JSON.parse(validJsonString);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            return null; // or handle the error as appropriate
        }
    }










}