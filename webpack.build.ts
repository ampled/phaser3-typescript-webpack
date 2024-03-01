import { Configuration } from 'webpack';
import config from './webpack.config';
import TerserPlugin from 'terser-webpack-plugin';

const buildConfig: Configuration = {
  ...config,
  optimization: { minimize: true, minimizer: [new TerserPlugin()] },
};

export default buildConfig;
