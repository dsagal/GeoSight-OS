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
   GENERAL WIDGET FOR SHOWING SUMMARY OF DATA
   ========================================================================== */

import React, { Fragment } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";

import { DEFINITION } from "../index"
import { numberWithCommas } from '../../../utils/main'

/**
 * General widget to show summary of data.
 * @param {int} idx Index of widget
 * @param {list} data List of data {value, date}
 * @param {object} widgetData Widget Data
 */
export default function Index(
  { data, widgetData }
) {
  const { name, config } = widgetData
  const { operation, property_2 } = config

  const {
    referenceLayer
  } = useSelector(state => state.dashboard.data);
  const geometries = useSelector(state => state.datasetGeometries[referenceLayer?.identifier]);

  /**
   * Return value of widget
   * @returns {JSX.Element}
   */
  function getValue() {
    if (!data || !geometries) {
      return (
        <div className="dashboard__right_side__loading">
          <CircularProgress />
        </div>
      );
    }

    let byGroup = {};

    data.forEach((row) => {
      let groupName = row[property_2];
      const value = parseFloat(row.value);

      if (property_2 === "geometry_code") {
        for (const level of Object.values(geometries)) {
          if (level[groupName]) {
            groupName = level[groupName].label;
          }
        }
      }

      if (!byGroup[groupName]) {
        byGroup[groupName] = [];
      }

      if (!isNaN(value)) {
        byGroup[groupName].push(value);
      }
    });

    const result = {};
    for (const [group, values] of Object.entries(byGroup)) {
      const total = values.reduce((a, b) => a + b, 0);
      switch (operation) {
        case DEFINITION.WidgetOperation.SUM:
          result[group] = total;
          break;
        case DEFINITION.WidgetOperation.MIN:
          result[group] = Math.min(...values);
          break;
        case DEFINITION.WidgetOperation.MAX:
          result[group] = Math.max(...values);
          break;
        case DEFINITION.WidgetOperation.AVG:
          result[group] = values.length ? total / values.length : 0;
          break;
        case DEFINITION.WidgetOperation.COUNT:
          result[group] = values.length;
          break;
        case DEFINITION.WidgetOperation.COUNT_UNIQUE:
          result[group] = new Set(values).size;
          break;
        default:
          return <div className="widget__error">Operation Not Found</div>;
      }
    }

    const sorted = Object.entries(result).sort((a, b) => b[1] - a[1]);

    const topN = parseInt(config.top_n);
    const limited = !isNaN(topN) && topN > 0 ? sorted.slice(0, topN) : sorted;

    const maxVal = Math.max(...limited.map(([_, val]) => val), 1); // fallback = 1

    return (
      <table>
        <tbody>
          {limited.map(([key, val], index) => (
            <tr key={index} className="widget__sgw__row">
              <td className="widget__sgw__row__name">{key}</td>
              <td>
                <div style={{ width: `${(val / maxVal) * 80 + 20}%` }}>
                  {numberWithCommas(val)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <Fragment>
      <div className='widget__sw widget__sgw'>
        <div className='widget__title'>{name}</div>
        <div className='widget__content'>{getValue()}</div>
      </div>
    </Fragment>
  )
}
