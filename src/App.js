import moment from 'moment';
import 'moment/locale/fr';

import './App.css';
import {useEffect, useState} from "react";
import tests from "./timingsTest"
import tmv from "./timings-tmv"

function Ftn({number, unit, hideIfZero = true}) {
    if (hideIfZero && !number) {
        return;
    }
    return <span className="ftn">
        {number.toString().padStart(2, "0")}
        <span>{unit}{" "}</span>
    </span>
}

function Upcoming({current, timings}) {

    const currentIndex = timings.indexOf(current);
    const nextIndex = (currentIndex + 1) % timings.length;

    return <div className="upcoming">
        {timings.map((timing, i) => {
            const duration = timing.to ? moment.duration(timing.to.diff(timing.from)).minutes() : null;
            const passed = i < nextIndex;
            if (passed) {
                return null;
            }

            return (<div key={i} className={`${passed ? "passed" : ""}`}>
                <div className="datetime">
                    <div className="name">{timing.name}</div>
                    {timing.from.format("HH:mm")}
                    {timing.to ? (timing.to.format(" – HH:mm ")) : null}
                    {duration ? <span>[{duration}min]</span> : null}
                </div>
            </div>)
        })}
    </div>
}

function Current({now, timing}) {
    const [rest, setRest] = useState(moment.duration());
    const [inTalk, setInTalk] = useState(false)
    useEffect(() => {
        if (!timing) {
            return;
        }
        let aim;
        if (timing.from.diff(now) < 0) {
            aim = timing.to;
        } else {
            aim = timing.from;
        }
        //aim = aim.add(1, "seconds");
        setRest(moment.duration(aim.diff(now)));

        if (timing.to) {
            setInTalk(now.isBetween(timing.from, timing.to));
        }

    }, [now, timing]);

    if (!timing) {
        return null;
    }

    if (!rest) {
        return null;
    }

    const duration = timing.to ? moment.duration(timing.to.diff(timing.from)).minutes() : null;
    const color = rest.asMinutes() <= 10 ? rest.asMinutes() <= 5 ? "red" : "orange" : "";

    return <div className="App-next">
        <div className="rest" style={{color: color}}>
            {inTalk && "🗣️ "}
            <Ftn number={rest.days()} unit="j"/>
            <Ftn number={rest.hours()} unit="h"/>
            <Ftn number={rest.minutes()} unit="min"/>
            <Ftn number={rest.seconds()} unit="s" hideIfZero={false}/>
        </div>
        <div className="datetime">
            <div className="name">{timing.name}</div>
            {timing.from.format("HH:mm")}
            {timing.to ? (timing.to.format(" – HH:mm ")) : null}
            {duration ? <span>[{duration}min]</span> : null}
        </div>
    </div>
}

function setDataTest({setTimings}) {
    setTimings(tests.map((track) => ({
        name: track.name,
        from: moment(track.from),
        to: track.to ? moment(track.to) : undefined
    })));
}

function setData({setTimings}) {
    setTimings(tmv.map((track) => ({
        name: track.name,
        from: moment(track.from),
        to: track.to ? moment(track.to) : undefined
    })));
}

function App() {
    const [now, setNow] = useState(moment());
    const [current, setCurrent] = useState();
    const [timings, setTimings] = useState([]);

    useEffect(() => {
        setData({setTimings});
        //setDataTest({setTimings, setTracks});
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(moment());

            setCurrent(timings.find((timing) => {
                return moment(timing.from).diff(now) > 0;
            }));
        }, 1000);

        return () => {
            clearInterval(interval)
        }
    }, [now, timings]);

    return (
        <div className="App">
            <header className="App-header">
                <div className="App-header-now">
                    <div className="date">
                        {now.format("ddd DD MMM YYYY")}
                    </div>

                    <div className="time">
                        {now.format("HH:mm:ss")}
                    </div>
                </div>
            </header>
            <main className="App-main">
                <Current now={now} timing={current}/>
                <Upcoming current={current} timings={timings}/>
            </main>
        </div>
    );
}

export default App;
