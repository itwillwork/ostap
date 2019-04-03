# ostap

CLI tool that fast checks if your bundle contains multiple versions of the same package, only by looking in package.json.

Advantages:

* faster than alternatives, since it doesn't require rebuilding the bundle (example, [duplicate-package-checker-webpack-plugin](https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin));

* uses only package.json;

* suggests optimal package versions; [see how](#for-suggests-optimal-package-versions)

* you can quickly see all the current versions of the same package that are used in the current bundle. [see how](#for-see-all-the-current-versions-of-the-same-package-that-are-used-in-the-current-bundle)

## Quick start
```
npm i -g ostap

# create package.json if not exists
echo "{\"name\":\"demo-project\",\"version\":\"1.0.0\",\"dependencies\":{\"@nivo/bar\":\"0.54.0\",\"@nivo/core\":\"0.53.0\",\"@nivo/pie\":\"0.54.0\",\"@nivo/stream\":\"0.54.0\"}}" > ./package.json

ostap ./package.json -s
```

## How to use

For example, you have `package.json`:
```
{
  "name": "demo-project",
  "version": "1.0.0",
  "dependencies": {
    "@nivo/bar": "0.54.0",
    "@nivo/core": "0.53.0",
    "@nivo/pie": "0.54.0",
    "@nivo/stream": "0.54.0"
  }
}
```
### For suggests optimal package versions

```
ostap ./package.json
```
<img src="https://github.com/itwillwork/ostap/blob/master/media/demo5.png?raw=true" width="650px" />

### For see all the current versions of the same package that are used in the current bundle

```
ostap ./package.json -s
```
<img src="https://github.com/itwillwork/ostap/blob/master/media/demo7.png?raw=true" width="650px" />

### Installation
```
npm i -g ostap
```
### Options
```
Options:
  -c, --use-cache                Use cache 
  -d, --duplicates               Show duplicates in source and optimal tree 
  -s, --source-tree-duplicates   Show duplicates in source tree 
  -o, --optimal-tree-duplicates  Show duplicates in optimal tree 
  -v, --version                  Display version number 
  -h, --help                     Display help 
```
## Contributing
Got ideas on how to make this better? Open an issue!

## License
MIT
