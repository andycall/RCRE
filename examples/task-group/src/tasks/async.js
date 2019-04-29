export async function asyncRequest(params) {
  return await new Promise((resolve, reject) => {
      setTimeout(() => {
        params.actions.taskPass({
          model: 'demo1',
          data: {
            test: '1234'
          }
        });

        resolve(true);
      }, 1000);
  });
}