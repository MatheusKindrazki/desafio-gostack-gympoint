import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const students = await Student.findAll({
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    return res.json(students);
  }

  async show(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    return res.json(student);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const student = await Student.findByPk(id, {
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    if (req.body.email) {
      const studentExists = await Student.findOne({
        where: { email: req.body.email },
      });

      if (studentExists && studentExists.id !== student.id) {
        return res.status(400).json({ error: 'E-mail already registered' });
      }
    }

    const { name, email, age, weight, height } = await student.update(req.body);

    await student.save();

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    await student.destroy();

    return res.json({ message: 'Student deleted successfully.' });
  }
}

export default new StudentController();
