module.exports  = {
    promptTypeList:[{
        type: 'list',
        message: '请选择拉取的模版类型:',
        name: 'type',
        choices: [{
          name: 'mobile',
          value: {
            url: '',
            gitName: 'vue-web-template',
            val:'移动端模版'
          }
        },{
          name: 'pc',
          value: {
            url: 'https://github.com/littleTreeme/vue-web-template.git',
            gitName: 'vue-web-template',
            val:'PC端模版'
          }
        }]
    }],
};