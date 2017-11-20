import { Injectable, NgZone } from '@angular/core';
import { Geolocation, Geoposition } from 'ionic-native';
import 'rxjs/add/operator/filter';

@Injectable()
export class LocationTracker {

    public watch: any;
    public lat: number = 0;
    public lng: number = 0;
    public smokedata: SmokeData;
    public ws: WebSocket;
    public kindlist: any = [ "담배", "화재" ];
    public placelist: any = [ "1층복도", "2층화장실", "교실" ];

    constructor(public zone: NgZone) {
        this.ws = new WebSocket("ws://ptgetter2.iptime.org:5000");
        this.ws.onopen = function () {
            console.log("connected");
        };
        this.ws.onmessage = function (evt) {
            console.log(evt.data);
        };
        this.ws.onerror = function (evt) {
            console.log(evt);
        };
        this.ws.onclose = function () {
            console.log("disconnected");
        };
    }

    generateSmokeData() {
        this.smokedata = new SmokeData();
        this.smokedata.kind = this.kindlist[this.randomInt(0, this.kindlist.length-1)];
        this.smokedata.level = this.randomInt(0, 4);
        this.smokedata.plcae = this.placelist[this.randomInt(0, this.placelist.length-1)];
        console.log('Smoke data' + this.smokedata);
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    sendSmokeData() {
        console.log("sendSmokeData");
        if (this.ws.readyState == WebSocket.OPEN) {
            var msg = {
                lat: this.lat,
                lng: this.lng,
                level: this.smokedata.level,
                kind: this.smokedata.kind,
                place: this.smokedata.plcae,
                date: this.getTimeStamp()
            };
            this.ws.send(JSON.stringify(msg));
        }
        else {
            console.log("Connection is closed");
        }
    }

    getTimeStamp() {
        var d = new Date();
        var s =
            this.leadingZeros(d.getFullYear(), 4) + '-' +
            this.leadingZeros(d.getMonth() + 1, 2) + '-' +
            this.leadingZeros(d.getDate(), 2) + ' ' +

            this.leadingZeros(d.getHours(), 2) + ':' +
            this.leadingZeros(d.getMinutes(), 2) + ':' +
            this.leadingZeros(d.getSeconds(), 2);

        return s;
    }

    leadingZeros(n, digits) {
        var zero = '';
        n = n.toString();

        if (n.length < digits) {
            for (var i = 0; i < digits - n.length; i++)
                zero += '0';
        }
        return zero + n;
    }

    startTracking() {
        Geolocation.getCurrentPosition().then((data) => {
            console.log('My latitude : ', data.coords.latitude);
            console.log('My longitude: ', data.coords.longitude);
            this.lat = data.coords.latitude;
            this.lng = data.coords.longitude;
            this.generateSmokeData();
            this.sendSmokeData();
        });       
    }

    stopTracking() {
        console.log('stopTracking');
        
    }

}

export class SmokeData {
    public level: number;
    public kind: string;
    public plcae: string;

    toString() {
        return this.kind + "/" + this.level + "/" + this.plcae;
    }
}