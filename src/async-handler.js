export default function asyncHandler(handler) {
  return async function (req, res, next) {
    try {
      await handler(req, res);
    } catch (e) {
      console.log("Error occured");
      next(e);
    }
  };
}

// 이젠 async-handler를 확인하고 싶으면 git checkout 해쉬아이디 로 돌아가서 확인 가능
