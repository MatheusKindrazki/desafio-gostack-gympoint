import { isAfter } from 'date-fns';
import * as Yup from 'yup';

import Enrollment from '../models/Enrollment';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async index(req, res) {
    const { page = 1, quantity = 20 } = req.query;

    const { id } = req.params;

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: id },
      limit: quantity,
      offset: (page - 1) * quantity,
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const { id } = req.params;
    const { question } = req.body;

    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    // Verifica se o aluno está ativo
    const activeStudent = await Enrollment.findOne({
      where: { student_id: id },
    });

    if (!activeStudent || !isAfter(activeStudent.end_date, new Date())) {
      return res
        .status(401)
        .json({ error: 'Student does not have an active enrollment.' });
    }

    const helpOrder = await HelpOrder.create({ student_id: id, question });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
