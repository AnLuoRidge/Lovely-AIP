module.exports = {
  mongoURI: process.env.KF_MONGO_URI,
  secretOrKey: 'secret',
  port: process.env.KF_PORT || 5000,
  testMongoURL: 'mongodb://lovely-aip:lovelyaip726@ds020208.mlab.com:20208/lovely-aip-test',
  testPort: 5001,
  email: process.env.KF_EMAIL,
  emailPwd: process.env.KF_EMAIL_PWD,
  emailServiceProvider: process.env.KF_EMAIL_SERVICE_PROVIDER,
  frontendHost: process.env.NODE_ENV === 'production'
    ? 'http://knight-frank-web.s3-website-ap-southeast-2.amazonaws.com' : 'http://localhost:3000',
  backendHost: process.env.NODE_ENV === 'production'
    ? 'http://lovelyaip-env.wsr3nv3er9.ap-southeast-2.elasticbeanstalk.com' : `localhost:${process.env.PORT || 5000}`,
  redisURI: process.env.KF_REDIS_URI,
  redisPort: process.env.KF_REDIS_PORT,
  redisPwd: process.env.KF_REDIS_PWD,
};
