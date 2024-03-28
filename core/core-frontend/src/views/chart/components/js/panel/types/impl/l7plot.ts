import { ViewLevel } from '@antv/l7plot/dist/esm/plots/choropleth/types'
import { FeatureCollection } from '@antv/l7plot/dist/esm/plots/choropleth/types'
import { PlotOptions } from '@antv/l7plot/dist/esm/types/plot'
import { Plot as L7Plot } from '@antv/l7plot/dist/esm/core/plot'
import {
  configL7Label,
  configL7Legend,
  configL7Style,
  configL7Tooltip,
  configL7Zoom
} from '@/views/chart/components/js/panel/common/common_antv'
import {
  AntVAbstractChartView,
  AntVDrawOptions,
  ChartLibraryType
} from '@/views/chart/components/js/panel/types'
import { cloneDeep, defaultsDeep } from 'lodash-es'
import { ChoroplethOptions } from '@antv/l7plot/dist/esm/plots/choropleth'
import { parseJson } from '@/views/chart/components/js/util'

export interface L7PlotDrawOptions<P> extends AntVDrawOptions<P> {
  areaId?: string
  level?: ViewLevel['level']
  geoJson?: FeatureCollection
}
// S2 or others to be defined next
export abstract class L7PlotChartView<
  O extends PlotOptions,
  P extends L7Plot<O>
> extends AntVAbstractChartView {
  public abstract drawChart(drawOption: L7PlotDrawOptions<P>): P | Promise<P>

  protected configLabel(chart: Chart, options: O): O {
    const label = configL7Label(chart)
    defaultsDeep(options.label, label)
    return options
  }

  protected configStyle(chart: Chart, options: O): O {
    const style = configL7Style(chart)
    defaultsDeep(options['style'], style)
    return options
  }

  protected configTooltip(chart: Chart, options: O): O {
    const tooltip = configL7Tooltip(chart)
    defaultsDeep(options.tooltip, tooltip)
    return options
  }
  protected configLegend(_: Chart, options: ChoroplethOptions) {
    const legend = configL7Legend()
    defaultsDeep(options.legend, legend)
    return options
  }
  protected configEmptyDataStrategy(chart: Chart, options: ChoroplethOptions): ChoroplethOptions {
    const { functionCfg } = parseJson(chart.senior)
    const emptyDataStrategy = functionCfg.emptyDataStrategy
    if (!emptyDataStrategy || emptyDataStrategy === 'breakLine') {
      return options
    }
    const data = cloneDeep(options.source.data)
    if (emptyDataStrategy === 'setZero') {
      data.forEach(item => {
        item.value === null && (item.value = 0)
      })
    }
    if (emptyDataStrategy === 'ignoreData') {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].value === null) {
          data.splice(i, 1)
        }
      }
    }
    options.source.data = data
    return options
  }

  protected configZoomButton(plot: P) {
    configL7Zoom(plot)
  }
  protected constructor(name: string, defaultData?: any[]) {
    super(ChartLibraryType.L7_PLOT, name)
    this.defaultData = defaultData
  }
  protected abstract setupOptions(chart: Chart, options: O): O
}
