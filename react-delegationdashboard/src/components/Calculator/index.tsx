import React, { useState, useEffect } from 'react';
import { useContext } from 'context';
import { isMobile } from 'react-device-detect';
import { denomination, decimals } from 'config';
import denominate from 'components/Denominate/formatters';
import nominate from 'helpers/nominate';
import StatCard from 'components/StatCard';

export const Calculator = () => {
  const { egldLabel, aprPercentageAfterFee, USD } = useContext();
  const [daily, setDaily] = useState('0');
  const [weekly, setWeekly] = useState('0');
  const [monthly, setMonthly] = useState('0');
  const [yearly, setYearly] = useState('0');
  const [value, setValue] = useState(50);

  const getReward = (value: number) => {
    setValue(value);
  };
  useEffect(() => {
    setYearly((value * (parseFloat(aprPercentageAfterFee) / 100)).toFixed(4));
    setMonthly((parseFloat(yearly) / 12).toFixed(4));
    setWeekly((parseFloat(yearly) / 52).toFixed(4));
    setDaily((parseFloat(yearly) / 365).toFixed(4));
  }, []);

  useEffect(() => {
    setYearly((value * (parseFloat(aprPercentageAfterFee) / 100)).toFixed(4));
    setMonthly((parseFloat(yearly) / 12).toFixed(4));
    setWeekly((parseFloat(yearly) / 52).toFixed(4));
    setDaily((parseFloat(yearly) / 365).toFixed(4));
  }, [value, aprPercentageAfterFee, yearly]);

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

  if (aprPercentageAfterFee == '...') {
    return null;
  }

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
      <div className="form-group text-center" style={{ marginLeft: '27%', marginRight: '27%' }}>
        <label htmlFor="amount">How many {egldLabel} do you want to stake ?</label>
        <input
          type="number"
          className="form-control"
          style={{textAlign: 'center'}}
          id="amount"
          min="10"
          step="any"
          value={value}
          autoComplete="off"
          onChange={e => getReward(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};
