import moment from 'moment';
import 'moment/locale/fr';

import './App.css';
import {useEffect, useState} from "react";
//import timings from "./timings"
import timings from "./timings-tmv"

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
            const duration = timing.to ? moment.duration(moment(timing.to).diff(timing.from)).minutes() : null;
            const passed = i < nextIndex;

            return (<div key={i} className={`${passed ? "passed" : ""}`}>
                <div className="datetime">
                    <div className="name">{timing.name}</div>
                    {moment(timing.from).format("HH:mm")}
                    {timing.to ? (moment(timing.to).format(" – HH:mm ")) : null}
                    {duration ? <span>[{duration}min]</span> : null}
                </div>
            </div>)
        })}
    </div>
}

function Current({now, timing}) {
    const [rest, setRest] = useState(moment.duration());
    useEffect(() => {
        if (!timing) {
            return;
        }
        setRest(moment.duration(moment(timing.from).diff()));
    }, [now, timing]);

    if (!timing) {
        return null;
    }

    if (!rest) {
        return null;
    }

    const duration = timing.to ? moment.duration(moment(timing.to).diff(timing.from)).minutes() : null;
    const color = rest.asMinutes() <= 10 ? rest.asMinutes() <= 5 ? "red" : "orange" : "";

    return <div className="App-next">
        <div className="rest" style={{color: color}}>
            <Ftn number={rest.hours()} unit="h" />
            <Ftn number={rest.minutes()} unit="min" />
            <Ftn number={rest.seconds()} unit="s" hideIfZero={false} />
        </div>
        <div className="datetime">
            <div className="name">{timing.name}</div>
            {moment(timing.from).format("HH:mm")}
            {timing.to ? (moment(timing.to).format(" – HH:mm ")) : null}
            {duration ? <span>[{duration}min]</span> : null}
        </div>
    </div>
}


function App() {
    const [now, setNow] = useState(moment());
    const [current, setCurrent] = useState()

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(moment());

            setCurrent(timings.find((timing) => {
                return moment(timing.from).diff(now) >= 0;
            }));
        }, 1000);

        return () => {clearInterval(interval)}
    }, [now]);

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
                <Current now={now} timing={current} />
                <Upcoming current={current} timings={timings} />
            </main>
        </div>
    );
}

export default App;
