/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   GENERAL WIDGET FOR SHOWING SUMMARY OF DATA PER GROUP
   ========================================================================== */

import React, { Fragment } from 'react';
import CircularProgress from "@mui/material/CircularProgress";

import { DEFINITION } from "../index"
import { numberWithCommas } from '../../../utils/main'

/**
 * General widget to show summary of data.
 * @param {int} idx Index of widget
 * @param {list} data List of data {value, date}
 * @param {object} widgetData Widget Data
 */
export default function SummaryWidget(
  { data, widgetData }
) {
  const { name, config } = widgetData
  const { unit, operation } = config

  /**
   * Return value of widget
   * @returns {JSX.Element}
   */
  function getValue() {
    if (data !== null && Array.isArray(data)) {
      const values = data
        .map((d) => parseFloat(d.value))
        .filter((v) => !isNaN(v));

      const topN = parseInt(widgetData.config?.top_n);
      const sortedValues = [...values].sort((a, b) => b - a);
      const finalValues =
        !isNaN(topN) && topN > 0 ? sortedValues.slice(0, topN) : values;

      switch (operation) {
        case DEFINITION.WidgetOperation.SUM:
          const total = finalValues.reduce((acc, val) => acc + val, 0);
          return (
            <span>
              {numberWithCommas(total)} {unit}
            </span>
          );

        case DEFINITION.WidgetOperation.MIN:
          const min = Math.min(...finalValues);
          return (
            <span>
              {numberWithCommas(min)} {unit}
            </span>
          );

        case DEFINITION.WidgetOperation.MAX:
          const max = Math.max(...finalValues);
          return (
            <span>
              {numberWithCommas(max)} {unit}
            </span>
          );

        case DEFINITION.WidgetOperation.AVG:
          const avg =
            finalValues.length > 0
              ? finalValues.reduce((a, b) => a + b, 0) / finalValues.length
              : 0;
          return (
            <span>
              {numberWithCommas(avg.toFixed(2))} {unit}
            </span>
          );

        case DEFINITION.WidgetOperation.COUNT:
          return <span>{values.length} items</span>;

        case DEFINITION.WidgetOperation.COUNT_UNIQUE:
          const uniqueCount = new Set(values).size;
          return <span>{uniqueCount} unique</span>;

        default:
          return <div className='widget__error'>Operation Not Found</div>;
      }
    }
    return <div className='dashboard__right_side__loading'>
      <CircularProgress/>
    </div>
  }

  return (
    <Fragment>
      <div className='widget__sw'>
        <div className='widget__title'>{name}</div>
        <div className='widget__sw__content'>{getValue()}</div>
      </div>
    </Fragment>
  )
}
