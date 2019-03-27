# ostap

Cli that check your bundle contains multiple versions of the same package. Only by package.json.

<img src="https://github.com/itwillwork/ostap/blob/master/media/demo.png?raw=true" width="600px" />

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

Running with this `package.json`:
```
ostap ./package.json -d
```
See the results:

<img src="https://github.com/itwillwork/ostap/blob/master/media/demo.png?raw=true" width="600px" />

### Installation
```
npm i -g ostap
```
### Options
```
Options:
  -c, --flush-cache              Flush cache 
  -d, --duplicates               Show duplicates in source and optimal tree 
  -s, --source-tree-duplicates   Show duplicates in source tree 
  -o, --optimal-tree-duplicates  Show duplicates in optimal tree 
  -v, --version                  Display version number 
  -h, --help                     Display help 
```
## Quick start
```
npm i -g ostap

echo "{\"name\":\"demo-project\",\"version\":\"1.0.0\",\"dependencies\":{\"@nivo/bar\":\"0.54.0\",\"@nivo/core\":\"0.53.0\",\"@nivo/pie\":\"0.54.0\",\"@nivo/stream\":\"0.54.0\"}}" > ./simple-package.json

ostap ./simple-package.json -s
```
## Contributing
Got ideas on how to make this better? Open an issue!

## License
MIT
