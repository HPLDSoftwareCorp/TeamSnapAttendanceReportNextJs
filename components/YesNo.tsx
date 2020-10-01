import { ChangeEventHandler } from "react";
import React from "react";
import styles from "styles/YesNo.module.css";

export interface YesNoProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value: true | false | null | undefined;
}

export default function YesNo(props: YesNoProps) {
  return (
    <form className={styles.yesNoContainer}>
      <label>
        <input
          checked={props.value === true}
          name="answer"
          onChange={props.onChange}
          type="radio"
          value="true"
        />
        Yes
      </label>
      <label>
        <input
          checked={props.value === false}
          name="answer"
          onChange={props.onChange}
          type="radio"
          value="false"
        />
        No
      </label>
    </form>
  );
}
