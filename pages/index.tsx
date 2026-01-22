import React from "react";
import dynamic from "next/dynamic";
import { koppen } from "../koppen";
import { Legend } from "../components/Legend";
import styles from "../Home.module.css";
import { Card } from "../components/Card";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

const sorted = Object.entries(koppen).sort(([l], [r]) => {
  if (l < r) {
    return -1;
  } else if (l > r) {
    return 1;
  } else {
    return 0;
  }
});
const byFirstLetter = sorted.reduce((accum, e) => {
  const letter = e[0].charAt(0);
  const others = accum[letter] || [];
  return {
    ...accum,
    [letter]: [...others, e],
  };
}, {} as Record<string, typeof sorted>);

const Box: React.FC<{ color: string }> = ({ color }) => {
  return <div className={styles.box} style={{ backgroundColor: color }} />;
};

function defaultState(defaultValue = true) {
  return Object.keys(koppen).reduce((accum, key) => {
    return { ...accum, [key]: defaultValue };
  }, {} as Record<string, boolean>);
}

const IndexPage = () => {
  const [state, stateSet] = React.useState(defaultState());
  const [language, setLanguage] = React.useState<"en" | "ru">("en");

  return (
    <div className={styles.home}>
      <Card className={styles.card}>
        <h1 className={styles.header}>
          {language === "en"
            ? "Köppen–Geiger Climate Classification"
            : "Классификация климатов Кёппена"}
        </h1>
        <div>
          <a href="https://github.com/rjerue/koppen-map">Developed</a> with ❤️
          by <a href="https://jerue.org/">Ryan Jerue</a>
        </div>
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => setLanguage("en")}
            style={{
              marginRight: "10px",
              fontWeight: language === "en" ? "bold" : "normal",
            }}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("ru")}
            style={{ fontWeight: language === "ru" ? "bold" : "normal" }}
          >
            Русский
          </button>
        </div>
      </Card>
      <Map state={state} language={language} />
      <Legend legendTitle={language === "en" ? "Legend:" : "Легенда:"}>
        {Object.entries(byFirstLetter).map(([letter, values]) => {
          return (
            <div key={letter} className={`column ${styles.itemCol}`}>
              {values.map(([code, { title, titleRu, color }]) => {
                const active = state[code];
                const displayTitle = language === "ru" ? titleRu : title;
                return (
                  <div
                    onClick={() => stateSet({ ...state, [code]: !active })}
                    key={`${code}-legend`}
                    className={`${styles.item} ${styles.itemSm}`}
                  >
                    <Box color={active ? color : "gray"} /> {code} -{" "}
                    {displayTitle}
                  </div>
                );
              })}
            </div>
          );
        })}
        <div className={`column ${styles.resetClear}`}>
          <button onClick={() => stateSet(defaultState())}>
            {language === "en" ? "Reset" : "Сброс"}
          </button>
          <button onClick={() => stateSet(defaultState(false))}>
            {language === "en" ? "Clear" : "Очистить"}
          </button>
        </div>
      </Legend>
    </div>
  );
};

export default IndexPage;
