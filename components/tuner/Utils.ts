import Recording from 'react-native-recording'
import PicthFinder from 'pitchfinder'
import {PitchDetector} from 'pitchfinder/lib/detectors/types'
import { EmitterSubscription } from 'react-native';

export type TunerListenerData = {
    name: string,
    value: number;
    cents: number;
    octave: number;
    frequency: number;
}

const handlers: Set<(data: TunerListenerData)=>void> = new Set();

export default class TunerUtils {
    private sampleRate: number;
    private bufferSize: number;
    private picthFinder: PitchDetector;
    private middleA = 440;
    private semitone = 69;
    private noteStrings=[
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B"
    ]
    private listener: EmitterSubscription|null = null;

    constructor(sampleRate=22050,bufferSize=2048) {
        this.sampleRate=sampleRate;
        this.bufferSize=bufferSize;
        this.picthFinder = PicthFinder.YIN({sampleRate});
    }

    start() {
        if(this.listener !== null) this.listener.remove();
        Recording.init({
            sampleRate:this.sampleRate,
            bufferSize:this.bufferSize
        })
        Recording.start();
        this.listener = Recording.addRecordingEventListener((data)=>{
            const frequency = this.picthFinder(data);
            if(frequency) {
                const note = this.getNote(frequency);
                handlers.forEach(handler=>handler({
                    name: this.noteStrings[note % 12],
                    value: note,
                    cents:this.getCents(frequency,note),
                    octave:(note / 12) - 1,
                    frequency
                }));
            }
        })
    }
    stop(){
        Recording.stop();
        if(this.listener !== null) {
            this.listener.remove();
        }
    }

    private getNote(frequency: number){
        const note = 12 * (Math.log(frequency/this.middleA) / Math.log(2));
        return Math.round(note) + this.semitone;
    }

    private getStandardFrequency(note: number) {
        return this.middleA * Math.pow(2,(note - this.semitone) /12 );
    }

    private getCents(frequency:number,note:number) {
        return Math.floor((1200 * Math.log(frequency / this.getStandardFrequency(note))) / Math.log(2))
    }

    addListener(listener: (data: TunerListenerData)=>void){
        handlers.add(listener);
    }
    removeListener(listener: (data: TunerListenerData)=>void){
        handlers.delete(listener);
    }
}