import React, { useState, useEffect } from 'react';
import { useContext } from 'context';
import StatCard from 'components/StatCard';

interface Balance {
  balance?: number
  input?: boolean
}
export const Calculator = ({balance = 50, input = true}: Balance) => {
  const { egldLabel, aprPercentage, USD } = useContext();
  const [daily, setDaily] = useState('0');
  const [weekly, setWeekly] = useState('0');
  const [monthly, setMonthly] = useState('0');
  const [yearly, setYearly] = useState('0');
  const [value, setValue] = useState(balance);

  const APR = aprPercentage;
  const getReward = (value: number) => {
    setValue(value);
  };

  useEffect(() => {
    setYearly((value * (parseFloat(APR) / 100)).toFixed(4));
    setMonthly((parseFloat(yearly) / 12).toFixed(4));
    setWeekly((parseFloat(yearly) / 52).toFixed(4));
    setDaily((parseFloat(yearly) / 365).toFixed(4));
  }, []);

  useEffect(() => {
    setYearly((value * (parseFloat(APR) / 100)).toFixed(4));
    setMonthly((parseFloat(yearly) / 12).toFixed(4));
    setWeekly((parseFloat(yearly) / 52).toFixed(4));
    setDaily((parseFloat(yearly) / 365).toFixed(4));
  }, [value, aprPercentage, yearly]);

  if (aprPercentage == '...') {
    return null;
  }

  const cards = [
    {
      label: 'Daily',
      value: daily,
    },
    {
      label: 'Weekly',
      value: weekly,
    },
    {
      label: 'Monthly',
      value: monthly,
    },
    {
      label: 'Yearly',
      value: yearly,
    },
  ];

  return (
    <div>
      <div className="cards d-flex flex-wrap">
        {cards.map(({ label, value }, index) => (
          <StatCard
            key={index}
            title={label}
            valueUnit={egldLabel}
            svg="save-money.svg"
            color="orange"
            percentage={`$ ${(parseFloat(value) * USD).toFixed(2)}`}
            value={value.toString()}
          />
        ))}
      </div>
      {input && <div className="form-group text-center" style={{ marginLeft: '27%', marginRight: '27%' }}>
        <label htmlFor="amount">How many {egldLabel} do you want to stake ?</label>
        <input
          type="number"
          className="form-control"
          style={{textAlign: 'center'}}
          id="amount"
          min="1"
          step="any"
          value={value}
          autoComplete="off"
          onChange={e => getReward(parseFloat(e.target.value))}
        />
      </div>}
    </div>
  );
};
