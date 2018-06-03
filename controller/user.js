import UserModel from '../models/user';

 class User {
    constructor() {
        
    }
    async addUser(req, res, next) {
        const user = {
            user_name: 'hx',
            role: 0,
            city: '成都',
            password: 111111,
            sex: 1,
            age: 24,
        }
        const users = new UserModel(user);
        await users.save();
        res.send({err_code: 0, message: 'success'})
    }
}
export default new User;