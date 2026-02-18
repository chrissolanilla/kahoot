const path = require("path");
const widgetWebpack = require("materia-widget-development-kit/webpack-widget");
// const { VueLoaderPlugin } = require("vue-loader");

const srcPath = path.join(__dirname, "src") + path.sep;
const outputPath = path.join(__dirname, "build") + path.sep;

const rules = widgetWebpack.getDefaultRules();

const copy = [
  ...widgetWebpack.getDefaultCopyList(),
  { from: path.join(__dirname, "src", "demo.json"), to: path.join(outputPath, "demo.json") },
  { from: path.join(__dirname, "src", "_guides", "assets"), to: path.join(outputPath, "guides", "assets") },
];

const entries = {
  player: [path.join(srcPath, "player.html"), path.join(srcPath, "player.js"), path.join(srcPath, "player.scss")],
  creator: [path.join(srcPath, "creator.html"), path.join(srcPath, "creator.js"), path.join(srcPath, "creator.scss")],
  scoreScreen: [
    path.join(srcPath, "scoreScreen.html"),
    path.join(srcPath, "scoreScreen.js"),
    path.join(srcPath, "scoreScreen.scss"),
  ],
};

const options = {
  entries,
  copyList: copy,
  moduleRules: [
	  rules.loadHTMLAndReplaceMateriaScripts,
	  rules.loadAndPrefixSASS,
	  rules.copyImages,

	  // React / JSX
	  {
		test: /\.(js|jsx)$/,
		exclude: /node_modules/,
		use: {
		  loader: "babel-loader",
		  options: {
			presets: [
			  ["@babel/preset-env", { targets: "defaults" }],
			  ["@babel/preset-react", { runtime: "automatic" }],
			],
		  },
		},
	  },

	  { test: /\.svg$/, use: "raw-loader" },
	],

  // moduleRules: [
  //   rules.loadHTMLAndReplaceMateriaScripts,
  //   rules.loadAndPrefixSASS,
  //   rules.copyImages,
  //   { test: /\.svg$/, use: "raw-loader" },
  // ],
};

const buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options);

//vue injection
buildConfig.module = buildConfig.module || {};
buildConfig.module.rules = buildConfig.module.rules || [];

// buildConfig.module.rules.unshift({
//   test: /\.vue$/,
//   loader: "vue-loader",
// });

buildConfig.resolve = buildConfig.resolve || {};
// buildConfig.resolve.extensions = Array.from(
//   new Set([...(buildConfig.resolve.extensions || []), ".vue", ".js", ".json"])
// );

buildConfig.resolve.extensions = Array.from(
  new Set([...(buildConfig.resolve.extensions || []), ".js", ".jsx", ".json"])
);


// buildConfig.resolve.alias = {
//   ...(buildConfig.resolve.alias || {}),
//   vue$: "vue/dist/vue.esm-bundler.js",
// };

buildConfig.plugins = buildConfig.plugins || [];
// buildConfig.plugins.push(new VueLoaderPlugin());

module.exports = buildConfig;
