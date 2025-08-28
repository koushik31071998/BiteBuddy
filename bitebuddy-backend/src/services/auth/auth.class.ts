import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from './auth.schema';

export default class AuthService {
    static async register(name: string, email: string, password: string) {
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({ name, email, password: hashedPassword });

        const token = this.generateToken(createdUser._id.toString(), createdUser.role);
        console.log('token is ', token)
        console.log('created user=', createdUser)
        return { token, user: { id: createdUser._id, name: createdUser.name, email: createdUser.email } };
    }

    static async login(email: string, password: string) {
        const foundUser = await User.findOne({ email });
        if (!foundUser) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = this.generateToken(foundUser._id.toString(), foundUser.role);
        return { token, user: { id: foundUser._id, name: foundUser.name, email: foundUser.email } };
    }

    private static generateToken(id: string, role: string) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const secret: Secret = process.env.JWT_SECRET;
        const options: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn']
        };

        return jwt.sign({ id, role }, secret, options);
    }
}
