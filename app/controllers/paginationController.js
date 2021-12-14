import Leave from '../schema/LeaveSchema';

export const allLeave = async (req, res, next) => {
  try {
    let { user } = req;
    const { employee } = user;
    let { limit, page, year } = req.query;
    let { joinDate, dateOfBirth } = employee;

    let finenceYearStart = new Date(year, 3, 1);
    let finenceYearEnd = new Date(year + 1, 2, 31);
    let joiningData = new Date(joinDate);

    let probationOverDate = new Date(
      joiningData.getFullYear(),
      joiningData.getMonth() + 3,
      joiningData.getDay()
    );
    let dateOfBirthData = new Date(
      year,
      new Date(dateOfBirth).getMonth(),
      new Date(dateOfBirth).getDate()
    );
    let totalAllocatedLeave;

    if (
      probationOverDate.getFullYear() == year ||
      probationOverDate.getFullYear() == year + 1
    ) {
      let totalMonths;

      if (probationOverDate.getDate() > 15) {
        totalMonths = 11 - probationOverDate.getMonth() + 3;
      } else {
        totalMonths = 12 - probationOverDate.getMonth() + 3;
      }
      if (
        probationOverDate <= dateOfBirthData &&
        finenceYearEnd >= dateOfBirthData
      ) {
        let decimal = (totalMonths * 17) / 12;

        let reminder = decimal - parseInt(decimal, 10);
        if (reminder > 0.5) {
          totalAllocatedLeave = Math.ceil(decimal);
        } else if (reminder == 0.5) {
          totalAllocatedLeave = decimal;
        } else {
          totalAllocatedLeave = Math.floor(decimal);
        }
      } else {
        let decimal = (totalMonths * 16) / 12;

        let reminder = decimal - parseInt(decimal, 10);
        if (reminder > 0.5) {
          totalAllocatedLeave = Math.ceil(decimal);
        } else if (reminder == 0.5) {
          totalAllocatedLeave = decimal;
        } else {
          totalAllocatedLeave = Math.floor(decimal);
        }
      }
    } else if (probationOverDate.getFullYear > year) {
      totalAllocatedLeave = 0;
    } else {
      totalAllocatedLeave = 17;
    }

    console.log(totalAllocatedLeave);

    let floorDate = new Date(year, 3, 1);
    let floorYear = floorDate.getFullYear();
    let ceilDate = new Date(floorYear + 1, 2, 31);

    limit = parseInt(limit, 10) || 10;
    page = parseInt(page, 10) || 0;

    const fullLeaveTaken = await Leave.find({
      requestFrom: employee.id,
      createdAt: {
        $gte: floorDate,
        $lte: ceilDate,
      },
      status: 'approved',
      type: 'Full',
    });

    const halfLeaveTaken = await Leave.find({
      requestFrom: employee.id,
      createdAt: {
        $gte: floorDate,
        $lte: ceilDate,
      },
      status: 'approved',
      type: 'Half',
    });

    let halfLeave = halfLeaveTaken.length / 2;
    let count = 0;
    fullLeaveTaken.forEach((e) => {
      let startDate = new Date(e.startDate).toISOString().slice(0, 10);
      let endDate = new Date(e.endDate).toISOString().slice(0, 10);
      let minutes = new Date(endDate) - new Date(startDate);
      const diffInDays = minutes / (1000 * 60 * 60 * 24);
      count = count + diffInDays;
    });
    count = count + halfLeave;
    const data =
      (await Leave.find({
        requestFrom: employee.id,
        createdAt: {
          $gte: floorDate,
          $lte: ceilDate,
        },
      })
        .sort({ updatedAt: -1 })
        .populate('requestTo', {
          firstName: 1,
          lastName: 1,
          role: 1,
          id: 1,
        })
        .populate('requestFrom', {
          firstName: 1,
          lastName: 1,
          role: 1,
          id: 1,
        })
        .populate({
          path: 'approvedBy',
          populate: {
            path: 'author',
            select: {
              firstName: 1,
              lastName: 1,
              role: 1,
              id: 1,
            },
          },
        })
        .populate({
          path: 'rejectedBy',
          populate: 'author',
        })
        .skip(page * limit)
        .limit(limit)) || [];
    const totalPages = Math.ceil(data.length / limit);
    const hasNextPage = page + 1 < totalPages;
    const nextPage = page + 1 >= totalPages ? null : page + 1;
    const hasPrevPage = page - 1 >= 0;
    const prevPage = page - 1 <= 0 ? null : page - 1;
    next({
      totalPages,
      hasNextPage,
      nextPage,
      hasPrevPage,
      prevPage,
      data,
      totalLeaves: count,
      totalAllocatedLeave: totalAllocatedLeave,
    });
  } catch (error) {
    next(error);
  }
};
export const x = 3;
