# calculate-cn-node

A node script that could find chinese string in your project

## Usage

1. Use `npm install`

2. Use `node index.js <The file or directory you want> <output file>` command

   ```javascript
   // example
   node index.js src output.csv
   ```

3. If you use correctly，you could get a result as following：

   ![image-20230709001601231](https://typora-licodeao.oss-cn-guangzhou.aliyuncs.com/typoraImg/image-20230709001601231.png)

4. Happy hacking

## Tip

The index.js file must be located in the root directory of your project.

or, you could configure the command to adjust dynamically.

## Note

<font style="text-decoration: line-through">The disadvantage of this script is that it cannot make Chinese text form a word.</font>
<font style="text-decoration: line-through">If you want to solve this problem, maybe search about `nodejieba` registry etc.</font>

These problems above are resolved，by using `segment`registry.

If you want to look up it，[click here](https://github.com/leizongmin/node-segment)

## Todo

- [x] Consider multiple annotations
- [x] Optimize word segmentation ability
