var fs = require('fs');
var mkdirp = require('mkdirp');
var program = require('commander');
var generateMarkdown = require('./generate-markdown');
var path = require('path');
var ncp = require('ncp').ncp;

program
  .version('0.0.12')
  .option('--components <dir>', 'Components metadate location', null, 'components.json')
  .option('--portal <dir>', 'Dev portal root directory')
  .parse(process.argv);

var _fixBackticks = function(str) {
  str = str.replace(/```jsx/g, "{% highlight html %}");
  str = str.replace(/```/g, "{% endhighlight %}");
  return str;
}

var metadata = JSON.parse(fs.readFileSync(program.components).toString());

var images = path.dirname(program.components) + "/images";

var dirName = program.portal + '/source/_references/components/' + metadata.title.toLowerCase();
mkdirp.sync(dirName);

if (fs.existsSync(images)) {
  mkdirp.sync(dirName + "/images");
  ncp(images, dirName + "/images", function(err){
  });
}

for (var c in metadata.components) {
  var component = metadata.components[c];
  component.libraryTitle = metadata.title;
  if (component.component) {
    var fname = dirName + '/' + component.component.toLowerCase() + '.md';
    var md = generateMarkdown.generateDevPortal(component);
    md = _fixBackticks(md);
    fs.writeFileSync(fname, md);
  }
}