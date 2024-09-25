import { HttpHeaders } from "@angular/common/http";
import { AnalysisTrackDetail, PairedTrackJsonObject, Section, SpotifySettings, TrackAnalysisJsonObject, TrackJsonObject } from "../spotify/shared/models/spotify-models";
import { ActivityDetailJsonObject, ActivityJsonObject, StravaSettings } from "../strava/shared/models/strava-models";

export class Constants {

    public static baseServerUrl: string = 'https://localhost:44354/api/v1/';
    // public static baseServerUrl: string = 'https://aggregatorwebapi.azurewebsites.net/api/v1/';

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

    public static formatMilliseconds(milliseconds: number): string {
        if (milliseconds < 0) {
            throw new Error("Milliseconds cannot be negative");
        }

        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds
            % 60000) / 1000);

        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedSeconds = seconds.toString().padStart(2, "0");

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

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
            album: {
                type: track.track.album.type,
                album_type: track.track.album.album_type,
                href: track.track.album.href,
                id: track.track.album.id,
                images: track.track.album.images,
                name: track.track.album.name,
                release_date: track.track.album.release_date,
                release_date_precision: track.track.album.release_date_precision,
                uri: track.track.album.uri,
                artists: track.track.album.artists,
                external_urls: track.track.album.external_urls,
                total_tracks: track.track.album.total_tracks,
            },
            artists: track.track.artists,
            duration_ms: track.track.duration_ms,
            id: track.track.id,
            name: track.track.name,
            popularity: track.track.popularity,
            type: track.track.type,
            uri: track.track.uri,
            audio_features: {
                danceability: Math.round(track.audio_features.danceability * (100)),
                energy: Math.round(track.audio_features.energy * (100)),
                key: track.audio_features.key,
                loudness: Math.round(track.audio_features.loudness * (-10)),
                mode: track.audio_features.mode,
                speechiness: track.audio_features.speechiness,
                acousticness: track.audio_features.acousticness,
                instrumentalness: track.audio_features.instrumentalness,
                liveness: track.audio_features.liveness,
                valence: Math.round(track.audio_features.valence * (100)),
                tempo: Math.round(track.audio_features.tempo),
                type: track.audio_features.type,
                id: track.audio_features.id,
                uri: track.audio_features.uri,
                track_href: track.audio_features.track_href,
                analysis_url: track.audio_features.analysis_url,
                duration_ms: track.audio_features.duration_ms,
                time_signature: track.audio_features.time_signature,
            },
        };
        return trackJson;
    }

    public static typeCastTrackAnalysisJson(trackAnalysis: { sections: any[], track: AnalysisTrackDetail }): TrackAnalysisJsonObject {
        var correctedSections = trackAnalysis.sections.map((section: Section) => {
            return {
                ...section, // Spread the existing properties to retain them
                tempo: Math.round(section.tempo),
                loudness: Math.round(section.loudness * -10),
            };
        });

        var trackAnalysisJson: TrackAnalysisJsonObject = {
            sections: correctedSections,
            track: {
                num_samples: trackAnalysis.track.num_samples,
                duration: trackAnalysis.track.duration,
                sample_md5: trackAnalysis.track.sample_md5,
                offset_seconds: trackAnalysis.track.offset_seconds,
                window_seconds: trackAnalysis.track.window_seconds,
                analysis_sample_rate: trackAnalysis.track.analysis_sample_rate,
                analysis_channels: trackAnalysis.track.analysis_channels,
                end_of_fade_in: trackAnalysis.track.end_of_fade_in,
                start_of_fade_out: trackAnalysis.track.start_of_fade_out,
                loudness: Math.round(trackAnalysis.track.loudness * (-10)),
                tempo: Math.round(trackAnalysis.track.tempo),
                tempo_confidence: trackAnalysis.track.tempo_confidence,
                time_signature: trackAnalysis.track.time_signature,
                time_signature_confidence: trackAnalysis.track.time_signature_confidence,
                key: trackAnalysis.track.key,
                key_confidence: trackAnalysis.track.key_confidence,
                mode: trackAnalysis.track.mode,
                mode_confidence: trackAnalysis.track.mode_confidence
            }
        };
        return trackAnalysisJson
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


    public static generateRandomPrimeNGColor(): string {
        const primeNGColors = [
            '--blue-400', '--blue-600', '--blue-800',
            '--red-400', '--red-600', '--red-800',
            '--purple-400', '--purple-600', '--purple-800',
            '--teal-400', '--teal-600', '--teal-800',
            '--surface-400', '--surface-600',
            '--indigo-400', '--indigo-600', '--indigo-800',
            '--green-400', '--green-600', '--green-800',
            '--orange-400', '--orange-600', '--orange-800',
        ];
        const randomIndex =
            Math.floor(Math.random() * primeNGColors.length);
        return primeNGColors[randomIndex];
    }













}


