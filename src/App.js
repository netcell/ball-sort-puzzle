import React, { useState, useEffect } from "react";
import "rc-slider/assets/index.css";
import "./styles.css";
import _ from "lodash";
import randomColor from "randomcolor";
import bg from "./bg.png";
import bgDay from "./bgday.png";
import Slider from "rc-slider";
import { Swipeable } from "react-swipeable";

console.log(bg);

const LEFT = { row: 0, col: -1 };
const RIGHT = { row: 0, col: 1 };
const DOWN = { row: 1, col: 0 };
const UP = { row: -1, col: 0 };

const colors = [
  "0.9372549, 0.4509804, 0.654902",
  "0.5921569, 0.44313726, 0.84705883",
  "0.972549, 0.78431374, 0.3529412",
  "0.78039217, 0.827451, 0.3254902",
  "0.41568628, 0.7607843, 0.8392157",
  "0.37254903, 0.87058824, 0.7019608",
  "0.827451, 0.4392157, 0.3254902",
  "0.3372549, 0.3254902, 0.827451",
  "0.3529412, 0.827451, 0.3254902",
  "0.79607844, 0.3254902, 0.827451",
  "0.827451, 0.7529412, 0.3254902",
  "0.827451, 0.3254902, 0.45882353",
  "0.827451, 0.3254902, 0.3647059",
  "1, 0.62352943, 0.77254903"
].map(color => {
  const [r, g, b] = color.split(", ");
  return (
    "rgb(" + [(r * 255) >> 0, (g * 255) >> 0, (b * 255) >> 0].join(", ") + ")"
  );
});

export default function App() {
  const [showConfig, setShowConfig] = useState(false);

  const [showUI, setShowUI] = useState(true);
  const [themeDay, setThemeDay] = useState(false);

  const [gameState, setGameState] = useState([]);

  const [numColors, setNumColors] = useState(3);
  const [tubeHeight, setTubeHeight] = useState(4);
  const [numEmptyTube, setNumEmptyTube] = useState(2);

  const [selectedNode, setSelectedNode] = useState(null);
  const [highNode, setHighNode] = useState(null);

  const findColNodes = col => {
    return _.chain(gameState)
      .filter(node => node.col === col)
      .sortBy("row")
      .value();
  };

  const hashPosition = ({ row, col }) => `${row}.${col}`;

  const onClickTube = col => () => {
    const colNodes = findColNodes(col);
    const firstNode = colNodes[0];
    const node = gameState[selectedNode];
    if (node) {
      if (node.col === col) {
        setHighNode(null);
      } else if (
        !firstNode ||
        (colNodes.length < tubeHeight &&
          firstNode.colorIndex === node.colorIndex)
      ) {
        const newState = { ...gameState };
        newState[selectedNode] = {
          ...node,
          col,
          row: firstNode ? firstNode.row - 1 : tubeHeight - 1
        };
        setGameState(_.keyBy(newState, hashPosition));
        setHighNode(hashPosition(newState[selectedNode]));
        setTimeout(() => {
          setHighNode(null);
        }, 200);
      } else {
        setHighNode(null);
      }
      setSelectedNode(null);
    } else if (firstNode) {
      setSelectedNode(hashPosition(firstNode));
      setHighNode(hashPosition(firstNode));
    } else {
      setSelectedNode(null);
      setHighNode(null);
    }
  };

  const nodes = _.chain(numColors)
    .range()
    .map(colorIndex => {
      return _.range(tubeHeight).map(() => colorIndex);
    })
    .flatten()
    .shuffle()
    .value();

  const init = () => {
    setSelectedNode(null);
    const positions = _.chain(numColors)
      .range()
      .map(col => {
        return _.range(tubeHeight).map(row => ({ row, col }));
      })
      .flatten()
      .value();

    let state = _.chain(positions)
      .map((position, index) => {
        return {
          ...position,
          colorIndex: nodes[index],
          key: index
        };
      })
      .keyBy(hashPosition)
      .value();

    setGameState(state);
  };

  useEffect(init, [numColors, tubeHeight, numEmptyTube]);

  useEffect(() => {
    const handleKeyPressed = event => {
      switch (event.key) {
        case "q":
          setShowUI(!showUI);
          break;
        case "w":
          setThemeDay(!themeDay);
          break;
        case "e":
          setShowConfig(!showConfig);
          break;
        default:
          return;
      }
    };
    window.addEventListener("keyup", handleKeyPressed);
    return () => {
      window.removeEventListener("keyup", handleKeyPressed);
    };
  }, [showUI, themeDay, showConfig]);

  return (
    <Swipeable
      trackMouse
      delta={2}
      // onSwipedLeft={action(LEFT)}
      // onSwipedRight={action(RIGHT)}
      // onSwipedDown={action(DOWN)}
      // onSwipedUp={action(UP)}
    >
      <div
        className="App"
        style={{
          paddingTop: "50px",
          paddingBottom: "50px",
          margin: 0,
          background: `url(${themeDay ? bgDay : bg})`,
          backgroundSize: "cover",
          pointerEvent: "none",
          userSelect: "none",
          boxSizing: "border-box"
        }}
        tabIndex="0"
      >
        <div
          style={{
            height: "auto",
            opacity: showUI ? 1 : 0
          }}
        >
          <p
            style={{
              margin: 0
            }}
          >
            <span
              onClick={init}
              style={{
                color: "white",
                fontSize: "41px",
                textTransform: "uppercase",
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              Ball Sort
            </span>
          </p>
          <p
            style={{
              marginTop: 0
            }}
          >
            <span
              onClick={init}
              style={{
                color: "white",
                fontSize: "25px",
                textTransform: "uppercase",
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              Puzzle
            </span>
          </p>
          <div
            style={{
              height: showConfig ? 200 : 0,
              overflow: "hidden",
              transition: "ease all 0.2s"
            }}
          >
            <p
              style={{
                width: 300,
                margin: "0px auto 40px"
              }}
            >
              <label style={{ color: "white" }}>Colors {numColors}</label>
              <Slider
                dots
                step={1}
                value={numColors}
                min={3}
                max={6}
                onChange={setNumColors}
              />
            </p>
            <p
              style={{
                width: 300,
                margin: "30px auto 40px"
              }}
            >
              <label style={{ color: "white" }}>{tubeHeight} Height</label>
              <Slider
                dots
                step={1}
                value={tubeHeight}
                min={2}
                max={5}
                onChange={setTubeHeight}
              />
            </p>
            <p
              style={{
                marginBottom: "20px",
                width: 300,
                margin: "30px auto 40px"
              }}
            >
              <label style={{ color: "white" }}>
                {numEmptyTube} Empty Tubes
              </label>
              <Slider
                dots
                step={1}
                value={numEmptyTube}
                min={1}
                max={3}
                onChange={setNumEmptyTube}
              />
            </p>
          </div>

          <p>
            <span
              onClick={() => setShowConfig(!showConfig)}
              style={{
                padding: 10,
                color: "black",
                fontSize: "20px",
                textTransform: "uppercase",
                fontWeight: "bold",
                background: "#FFD200",
                cursor: "pointer",
                userSelect: "none",
                borderRadius: 10,
                boxShadow: "0 5px 0px 1px #CD5900"
              }}
            >
              {showConfig ? "Hide" : "Show"} Config
            </span>{" "}
            &emsp;
            <span
              onClick={init}
              style={{
                padding: 10,
                color: "black",
                fontSize: "20px",
                textTransform: "uppercase",
                fontWeight: "bold",
                background: "#FFD200",
                cursor: "pointer",
                userSelect: "none",
                borderRadius: 10,
                boxShadow: "0 5px 0px 1px #CD5900"
              }}
            >
              Reset
            </span>
          </p>
        </div>
        <div
          style={{
            width: (numColors + numEmptyTube) * 80 + 20,
            height: (tubeHeight + 1) * 60 + 40,
            position: "absolute",
            left: "50%",
            margin: "auto",
            // marginTop: 50,
            marginLeft: -((numColors + numEmptyTube) * 80 + 20) / 2,
            // border: "2px solid #BBBABB",
            // background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 15,
            transform: `scale(${5 / (numColors + numEmptyTube)})`,
            transformOrigin: "top center"
          }}
        >
          {_.range(numColors + numEmptyTube).map(col => (
            <div
              key={`tube-${col}`}
              onClick={onClickTube(col)}
              style={{
                borderRadius: "0px 0px 60px 60px",
                width: 60,
                height: tubeHeight * 60,
                position: "absolute",
                left: col * 80 + 15,
                top: 1 * 60 + 30,
                transition: "all ease 0.2s",
                border: themeDay ? `2px #ccc solid` : `2px white solid`,
                borderTop: "none"
              }}
            >
              <div
                style={{
                  borderRadius: 15,
                  width: 65,
                  height: 15,
                  position: "absolute",
                  left: -5,
                  top: -15,
                  transition: "all ease 0.2s",
                  border: themeDay ? `3px #ccc solid` : `3px white solid`,
                  borderBottom: "0px"
                }}
              />
            </div>
          ))}
          {_.map(gameState, ({ row, col, colorIndex, key, locked }) => (
            <div
              key={key}
              style={{
                borderRadius: 50,
                background: colors[colorIndex],
                width: 50,
                height: 50,
                position: "absolute",
                left: col * 80 + 20,
                top:
                  hashPosition({ row, col }) === highNode
                    ? 0 * 60 + 10
                    : (row + 1) * 60 + 30,
                transition: "all ease 0.2s",
                border: `2px white solid`,
                // boxShadow: themeDay
                //   ? "0 0 10px 1px rgba(0, 0, 0, 0.1)"
                //   : "0 0 10px 10px rgba(0, 0, 0, 0.5)",
                pointerEvents: "none"
              }}
            />
          ))}
        </div>
      </div>
    </Swipeable>
  );
}
