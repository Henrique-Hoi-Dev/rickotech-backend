import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      cpf: Yup.string(),
      data_nacimento: Yup.string(),
      cargo: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação' });
    }
    // fazendo verificação email
    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res
        .status(400)
        .json({ error: 'Esse email de usuário já existe.' });
    }

    const {
      id,
      name,
      email,
      provider,
      cpf,
      cargo,
      data_nacimento,
    } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
      cpf,
      cargo,
      data_nacimento,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(8)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExist = await User.findOne({ where: { email } });

      if (userExist) {
        return res
          .status(400)
          .json({ error: 'Esse email de usuário já existe.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha não corresponde' });
    }

    await user.update(req.body);

    const {
      id,
      name,
      avatar,
      endereco,
      cargo,
      data_nacimento,
      cpf,
      cep,
      logradouro,
      complemento,
      numero,
      bairro,
      cidade,
      uf,
    } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
      endereco,
      cargo,
      data_nacimento,
      cpf,
      cep,
      logradouro,
      complemento,
      numero,
      bairro,
      cidade,
      uf,
    });
  }
}
export default new UserController();
