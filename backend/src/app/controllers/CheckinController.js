import { subDays, isAfter } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';

import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1, quantity = 20 } = req.query;

    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.param))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const { rows: checkins, count } = await Checkin.findAndCountAll({
      where: { student_id: id },
      attributes: ['id', 'createdAt'],
      limit: quantity,
      offset: (page - 1) * quantity,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['updated_at', 'desc']],
    });

    return res
      .set({ 'Total-Pages': Math.ceil(count / quantity) })
      .json(checkins);
  }

  async store(req, res) {
    const { id } = req.params;

    // Verifica se o aluno está ativo
    const activeStudent = await Enrollment.findOne({
      where: { student_id: id },
    });

    if (!activeStudent || !isAfter(activeStudent.end_date, new Date())) {
      return res
        .status(401)
        .json({ error: 'Student does not have an active enrollment.' });
    }

    // Procura quantidade de checkins já feitos por estudante
    const checkins = await Checkin.findAll({
      where: {
        student_id: id,
        created_at: { [Op.between]: [subDays(new Date(), 7), new Date()] },
      },
    });

    if (checkins.length >= 5) {
      return res
        .status(401)
        .json({ error: 'Only 5 checkins allowed on weekdays.' });
    }

    const checkin = await Checkin.create({ student_id: id });

    return res.json(checkin);
  }
}

export default new CheckinController();
