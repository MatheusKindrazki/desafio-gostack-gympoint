import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const students = Student.findAll();

    return res.json(students);
  }

  async show(req, res) {
    const { id } = req.params;

    const student = Student.findByPk(id);

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

    const userExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { name, email, age, weight, height } = await Student.create(req.body);

    return res.json({
      name,
      email,
      age,
      weight,
      height,
    });
  }
}

export default new StudentController();
