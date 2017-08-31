### v0.5.6 [8/31/2017]
* 修复：打包时依赖本地项目，导致无法正常打包 (issues #1)[https://github.com/ssbunny/enormous-turnip-designer/issues/1];
* 修复：通过右键菜单批量修改行高、列宽后，无法再手工调整行高、列宽。

### v0.5.5 [8/16/2017]
* 修复：显示期间(displayMode=true)的边框效果再次切换回设计态(displayMode=false)时，边框无法消除。

### v0.5.4 [8/14/2017]
* 修复：调整对齐方式时，丢失其它样式(字体加粗、倾斜等)；
* 修复：删除行时，只是删除内容，没有调整相应的行高；
* 改变显示期间(displayMode=true)的边框效果

### v0.5.3 [7/24/2017]
* 修正 hansontable 更改行高配置后(updateSettings)，无法手工调整(manualRowResize)行高的 BUG.

### v0.5.2 [7/21/2017]
* Handsontable 设置列宽时存在BUG，修复其对该组件的影响；
* 设置字体时指定 line-height，防止大字号上下对齐时溢出单元格