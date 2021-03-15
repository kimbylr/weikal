module.exports = {
  externals: [
    {
      child_process: '{child_process:{spawn: () =>{}}}',
    },
  ],
};
